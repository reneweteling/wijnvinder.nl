/**
 * Scraper for gall.nl (Salesforce Commerce Cloud / Demandware).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products: [data-hook-product-tile] inside <div class="ptile ...">
 * - Product data JSON in: data-product attribute on .ptile element
 *   e.g. { name, id, price, brand, category, discount }
 * - URL: a.ptile_link href (relative, e.g. "/la-palma-reserva-chardonnay-wit-75cl-387843.html")
 * - Image: img.img src (first inside figure.ptile_image)
 * - Country: span.ptile_country text
 * - Vintage: <span> inside p.ptile_desc (after country, text is "2024")
 * - Pagination: ?sz=96&start=0, ?sz=96&start=96, etc.
 * - Total products: data-product count on first product → scrape until no tiles
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'
import { normalizeCountry } from '../country-map'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'gall')!

const PAGE_SIZE = 96

// Map category path strings to wine types
function inferTypeFromCategory(category: string): string | undefined {
  const lower = category.toLowerCase()
  if (lower.includes('rosé') || lower.includes('rose')) return 'rose'
  if (lower.includes('mousserende') || lower.includes('champagne') || lower.includes('cava') || lower.includes('prosecco')) return 'sparkling'
  if (lower.includes('rode') || lower.includes('rood')) return 'red'
  if (lower.includes('witte') || lower.includes('wit')) return 'white'
  return undefined
}

interface GallProductData {
  name?: string
  id?: string
  price?: number
  brand?: string
  category?: string
  discount?: number
}

export class GallScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let start = 0

    while (true) {
      const url = `${CONFIG.baseUrl}/wijn/?sz=${PAGE_SIZE}&start=${start}`
      console.log(`[gall] Fetching start=${start}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[gall] Failed to fetch start=${start}:`, err)
        break
      }

      // Products are identified by data-hook-product-tile attribute
      const tiles = $('[data-hook-product-tile]')

      if (tiles.length === 0) {
        console.log(`[gall] No product tiles at start=${start}, stopping`)
        break
      }

      for (let i = 0; i < tiles.length; i++) {
        const el = tiles.eq(i)

        // Get the parent .ptile element which has the data-product JSON
        const ptile = el.closest('.ptile').length > 0 ? el.closest('.ptile') : el.parent()

        // Parse data-product JSON attribute
        let productData: GallProductData = {}
        const dataProductRaw = ptile.attr('data-product') ?? el.attr('data-product')

        if (dataProductRaw) {
          try {
            productData = JSON.parse(
              dataProductRaw.replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            )
          } catch {
            // Continue without product data
          }
        }

        const name = productData.name ?? el.find('h2[itemprop="name"]').text().trim()
        if (!name) continue

        // URL: relative link from a.ptile_link
        const relativeUrl = el.find('a.ptile_link').attr('href')
          ?? el.closest('a').attr('href')
          ?? ''
        const productUrl = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${CONFIG.baseUrl}${relativeUrl}`
        if (!productUrl || productUrl === CONFIG.baseUrl) continue

        // Price from product data JSON (most reliable)
        const price = productData.price ?? NaN
        if (isNaN(price) || price <= 0) continue

        // Image URL
        const imageUrl =
          el.find('img.img').first().attr('src') ??
          el.find('figure img').first().attr('src') ??
          undefined

        // Country from span.ptile_country
        const countryText = el.find('.ptile_country').text().trim()
        const country = countryText ? normalizeCountry(countryText) : undefined

        // Producer (brand from data-product)
        const producer = productData.brand ?? undefined

        // Vintage: in p.ptile_desc, second span after country
        let vintage: number | undefined
        el.find('p.ptile_desc span').each((_j, spanEl) => {
          const text = $(spanEl).text().trim()
          const yearMatch = text.match(/^(19\d{2}|20\d{2})$/)
          if (yearMatch) {
            vintage = parseInt(yearMatch[1], 10)
          }
        })

        // Wine type from category path: e.g. "Wijn/Witte wijn/Volle witte wijn"
        const wineType = productData.category
          ? inferTypeFromCategory(productData.category)
          : undefined

        yield {
          name,
          producer,
          url: productUrl,
          imageUrl,
          price,
          country,
          vintage,
          type: wineType as ScrapedWine['type'],
        }
      }

      // Stop if we got fewer tiles than the page size (last page)
      if (tiles.length < PAGE_SIZE) {
        break
      }

      start += PAGE_SIZE
    }
  }
}
