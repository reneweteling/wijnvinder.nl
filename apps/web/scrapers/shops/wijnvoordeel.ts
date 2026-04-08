/**
 * Scraper for wijnvoordeel.nl (Magento-based store).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products are <li class="item product product-item">
 * - Name: .product-item-link (anchor text)
 * - URL:  .product-item-link href
 * - Image: .product-image-photo src
 * - Price: [data-price-type="finalPrice"] data-price-amount attribute
 * - Vintage + country: .product-item-details-top .small (e.g. "2024 | Spanje")
 * - Pagination: ?p=2&product_list_limit=96
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'
import { normalizeCountry } from '../country-map'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'wijnvoordeel')!

export class WijnvoordeelScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1
    // Wijnvoordeel ignores product_list_limit and always returns 18 products per page
    // (infinite scroll site). We paginate through all pages using ?p= parameter.
    const perPage = 18

    while (true) {
      const url = `${CONFIG.baseUrl}/wijn/?p=${page}`
      console.log(`[wijnvoordeel] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[wijnvoordeel] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('li.item.product.product-item')

      if (items.length === 0) {
        console.log(`[wijnvoordeel] No products on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        const name = el.find('a.product-item-link').text().trim()
        const productUrl = el.find('a.product-item-link').attr('href') ?? ''
        // Magento product items have multiple images: rating badges + bottle photo
        // Filter out badges (trophy, proefpanelpunten, hamersma, catavinum, berliner)
        // and placeholders to find the actual bottle image
        const BADGE_PATTERNS = ['proefpanelpunten', 'hamersma', 'trophy', 'catavinum', 'berliner', 'medaille', 'award', 'punten', 'luca-maroni', 'luca_maroni', 'vivino', 'gilbert', 'gaillard', 'hires_', 'pixel.png']
        let cleanImageUrl: string | undefined
        const allImgs = el.find('img.product-image-photo')
        for (let j = 0; j < allImgs.length; j++) {
          const img = allImgs.eq(j)
          const src = img.attr('data-src') ?? img.attr('src') ?? ''
          if (src.includes('/static/version') || src.includes('placeholder')) continue
          if (BADGE_PATTERNS.some(p => src.toLowerCase().includes(p))) continue
          // Skip small square images (160x160 are always badges)
          const maxW = img.attr('max-width')
          if (maxW && parseInt(maxW) <= 160) continue
          if (src.includes('/media/catalog/product/')) {
            cleanImageUrl = src
            break
          }
        }

        if (!name || !productUrl) continue

        // Price from data attribute (most reliable)
        const priceAttr = el
          .find('[data-price-type="finalPrice"]')
          .attr('data-price-amount')
        const price = priceAttr ? parseFloat(priceAttr) : NaN

        if (isNaN(price) || price <= 0) continue

        // Vintage + country from ".small" element: "2024 | Spanje" or "Spanje"
        const smallText = el.find('.product-item-details-top .small').text().trim()
        let vintage: number | undefined
        let country: string | undefined

        if (smallText) {
          const parts = smallText.split('|').map((p) => p.trim())
          for (const part of parts) {
            const yearMatch = part.match(/\b(19\d{2}|20\d{2})\b/)
            if (yearMatch) {
              vintage = parseInt(yearMatch[1], 10)
            } else if (part.length > 1) {
              const mapped = normalizeCountry(part)
              if (mapped) country = mapped
            }
          }
        }

        // Rating from .rating-result[title] e.g. title="88%"
        const ratingTitle = el.find('.rating-result').attr('title')
        let rating: number | undefined
        if (ratingTitle) {
          const pct = parseFloat(ratingTitle)
          if (!isNaN(pct) && pct > 0) rating = pct / 20
        }

        yield {
          name,
          url: productUrl,
          imageUrl: cleanImageUrl,
          price,
          vintage,
          country,
          rating,
        }
      }

      // Check if there's a next page
      const hasNextPage = $('a.action.next').length > 0
        || $(`link[rel="next"]`).length > 0

      if (!hasNextPage) {
        break
      }

      page++
    }
  }
}
