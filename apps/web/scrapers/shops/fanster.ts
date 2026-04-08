/**
 * Scraper for fanster.nl (Magento / Smartwave Porto theme).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Magento 2 store with Porto theme
 * - Wine types split across separate category URLs:
 *   /rode-wijn-online-bestellen, /witte-wijn-witte-wijnen,
 *   /de-mooiste-rose-wijnen-en-de-beste-rose-wijn-koop-je-online,
 *   /mousserende-wijn-cava-champagne-prosecco-cremant
 * - Products: <li class="item product product-item">
 * - Name: a.product-item-link text
 * - URL: a.product-item-link href
 * - Image: img.product-image-photo src
 * - Price: [data-price-type="finalPrice"] data-price-amount
 * - Pagination: ?product_list_limit=96&p=2
 */

import type { ScrapedWine, WineType } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'fanster')!

const WINE_CATEGORIES: { path: string; type: WineType }[] = [
  { path: '/rode-wijn-online-bestellen', type: 'red' },
  { path: '/witte-wijn-witte-wijnen', type: 'white' },
  { path: '/de-mooiste-rose-wijnen-en-de-beste-rose-wijn-koop-je-online', type: 'rose' },
  { path: '/mousserende-wijn-cava-champagne-prosecco-cremant', type: 'sparkling' },
]

const PER_PAGE = 96

export class FansterScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    for (const category of WINE_CATEGORIES) {
      yield* this.scrapeCategory(category.path, category.type)
    }
  }

  private async *scrapeCategory(
    categoryPath: string,
    wineType: WineType,
  ): AsyncGenerator<ScrapedWine> {
    let page = 1

    while (true) {
      const url = `${CONFIG.baseUrl}${categoryPath}?product_list_limit=${PER_PAGE}&p=${page}`
      console.log(`[fanster] Fetching ${wineType} page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[fanster] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('li.item.product.product-item')

      if (items.length === 0) {
        console.log(`[fanster] No products for ${wineType} on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        const name = el.find('a.product-item-link').text().trim()
        const productUrl = el.find('a.product-item-link').attr('href') ?? ''

        if (!name || !productUrl) continue

        // Image
        const imageUrl = el.find('img.product-image-photo').first().attr('src')
          ?? el.find('img.product-image-photo').first().attr('data-src')
          ?? undefined

        // Price from Magento data attribute
        const priceAttr = el
          .find('[data-price-type="finalPrice"]')
          .attr('data-price-amount')
        const price = priceAttr ? parseFloat(priceAttr) : NaN

        if (isNaN(price) || price <= 0) continue

        // Original price
        const originalPriceAttr = el
          .find('[data-price-type="oldPrice"]')
          .attr('data-price-amount')
        const originalPrice = originalPriceAttr
          ? parseFloat(originalPriceAttr)
          : undefined

        // Try to extract vintage from product name (e.g. "Wijn Name 2022")
        let vintage: number | undefined
        const vintageMatch = name.match(/\b(19\d{2}|20\d{2})\b/)
        if (vintageMatch) {
          vintage = parseInt(vintageMatch[1], 10)
        }

        yield {
          name,
          url: productUrl,
          imageUrl,
          price,
          originalPrice,
          vintage,
          type: wineType,
        }
      }

      // Check for next page
      const hasNextPage = $('a.action.next').length > 0
        || $('link[rel="next"]').length > 0

      if (!hasNextPage || items.length < PER_PAGE) {
        break
      }

      page++
    }
  }
}
