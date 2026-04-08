/**
 * Scraper for topdrinks.nl (Magento 2).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products: <li class="item product product-item">
 * - Product info: <div class="product-item-info" id="product-item-info_{id}">
 * - Brand: h4.product-item-brand-name span text
 * - Name: a.product-item-link text
 * - URL: a.product-item-link href (absolute)
 * - Image: img.product-image-photo src (with CDN optimization params)
 * - Price: [data-price-type="finalPrice"] data-price-amount
 * - Pagination: /wijn?p=2 (up to p=32 observed)
 * - Products per page: default ~48 per page
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'topdrinks')!

// Topdrinks returns 24 products per page regardless of any limit parameter
const PER_PAGE = 24

export class TopdrinksScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1

    while (true) {
      const url = `${CONFIG.baseUrl}/wijn?p=${page}`
      console.log(`[topdrinks] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[topdrinks] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('li.item.product.product-item')

      if (items.length === 0) {
        console.log(`[topdrinks] No products on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        const name = el.find('a.product-item-link').text().trim()
        const productUrl = el.find('a.product-item-link').attr('href') ?? ''

        if (!name || !productUrl) continue

        // Brand/producer from h4.product-item-brand-name
        const producer = el.find('h4.product-item-brand-name span').text().trim() || undefined

        // Image URL (strip optimization params for clean URL)
        const rawImageUrl = el.find('img.product-image-photo').first().attr('src') ?? undefined
        const imageUrl = rawImageUrl?.split('?')[0]

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

        // Try to extract vintage from product name (e.g. "Tropez Crazy Rose 2022 75cl")
        let vintage: number | undefined
        const vintageMatch = name.match(/\b(19\d{2}|20\d{2})\b/)
        if (vintageMatch) {
          vintage = parseInt(vintageMatch[1], 10)
        }

        yield {
          name,
          producer,
          url: productUrl,
          imageUrl,
          price,
          originalPrice,
          vintage,
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
