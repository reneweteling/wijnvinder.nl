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
import { fetchProductPage } from './fetch-description'

const DELAY_MS = 2000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function enrichDescriptions(): Promise<void> {
  // Find wines without descriptions
  const wines = await db.canonicalWine.findMany({
    where: { description: null },
    include: {
      listings: {
        where: { available: true },
        take: 1,
        include: { shop: { select: { slug: true } } },
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

    console.log(`[desc] [${i + 1}/${wines.length}] ${wine.name} — fetching ${listing.shop.slug}...`)

    const page = await fetchProductPage(listing.url)

    if (page.description) {
      await db.shopListing.update({
        where: { id: listing.id },
        data: { description: page.description },
      })
      await db.canonicalWine.update({
        where: { id: wine.id },
        data: {
          description: page.description,
          ...(page.imageUrl ? { imageUrl: page.imageUrl } : {}),
        },
      })
      enriched++
      console.log(`[desc]   ✓ ${page.description.slice(0, 80)}...`)
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
