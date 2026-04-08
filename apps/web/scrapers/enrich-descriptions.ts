/**
 * Enriches wines with descriptions from their shop product pages.
 *
 * Strategy:
 * - Find CanonicalWines without descriptions
 * - For each, fetch the first available ShopListing product page
 * - Extract description from meta tags (bc:tastingnote > og:description > meta description)
 * - Clean HTML entities and tags
 * - Update ShopListing.description and CanonicalWine.description
 * - 2s delay between requests
 */

import { db } from '@/lib/db/client'
import * as cheerio from 'cheerio'

const DELAY_MS = 2000

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

/** Decode HTML entities and strip tags */
function cleanHtml(html: string): string {
  // First decode HTML entities using cheerio
  const decoded = cheerio.load(`<p>${html}</p>`, { xml: false }).text()
  // Strip any remaining HTML tags
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchDescription(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': randomUA(),
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      console.warn(`[desc] HTTP ${response.status} for ${url}`)
      return null
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Try different meta tags in order of quality
    const tastingNote = $('meta[property="bc:tastingnote"]').attr('content')
    if (tastingNote) return cleanHtml(tastingNote)

    const ogDescription = $('meta[property="og:description"]').attr('content')
    if (ogDescription && ogDescription.length > 30) return cleanHtml(ogDescription)

    const shortDesc = $('meta[property="bc:shortDescription"]').attr('content')
    if (shortDesc) return cleanHtml(shortDesc)

    const metaDesc = $('meta[name="description"]').attr('content')
    if (metaDesc && metaDesc.length > 30) return cleanHtml(metaDesc)

    // Try product description div (Gall & Gall uses different structure)
    const productDesc = $('.product-description').text().trim()
    if (productDesc && productDesc.length > 30) return productDesc.slice(0, 500)

    return null
  } catch (err) {
    console.warn(`[desc] Error fetching ${url}:`, err)
    return null
  }
}

export async function enrichDescriptions(): Promise<void> {
  // Find wines without descriptions
  const wines = await db.canonicalWine.findMany({
    where: { description: null },
    include: {
      listings: {
        where: { available: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`[desc] Found ${wines.length} wines without descriptions`)

  let enriched = 0

  for (let i = 0; i < wines.length; i++) {
    const wine = wines[i]
    const listing = wine.listings[0]

    if (!listing) {
      console.log(`[desc] [${i + 1}/${wines.length}] ${wine.name} — no listing URL, skipping`)
      continue
    }

    console.log(`[desc] [${i + 1}/${wines.length}] ${wine.name} — fetching ${listing.shopSlug}...`)

    const description = await fetchDescription(listing.url)

    if (description) {
      // Update both listing and canonical wine
      await db.shopListing.update({
        where: { id: listing.id },
        data: { description },
      })
      await db.canonicalWine.update({
        where: { id: wine.id },
        data: { description },
      })
      enriched++
      console.log(`[desc]   ✓ ${description.slice(0, 80)}...`)
    } else {
      console.log(`[desc]   ✗ No description found`)
    }

    // Rate limit
    if (i < wines.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log(`[desc] Done: ${enriched}/${wines.length} wines enriched with descriptions`)
}

// CLI entry point
if (process.argv[1]?.includes('enrich-descriptions')) {
  enrichDescriptions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[desc] Failed:', err)
      process.exit(1)
    })
}
