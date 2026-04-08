/**
 * Scraper for dewijngoeroe.nl (Shopify / Warehouse theme).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products: <div class="product-item product-item--vertical">
 * - Vendor/Producer: a.product-item__vendor text
 * - Name: a.product-item__title text
 * - URL: a.product-item__title href (relative, e.g. /products/...)
 * - Image: img.product-item__primary-image data-src (lazy loaded, with {width}x placeholder)
 * - Price: span.price text (e.g. "€99,95")
 * - Pagination: /collections/all?page=2 (up to page 16 observed)
 *
 * Product names often contain vintage, volume and ABV:
 *   e.g. "'G' 2020 - Weingut Gesellmann - 75CL - 15,0% Vol."
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'dewijngoeroe')!

const PER_PAGE = 24 // Shopify default

export class DeWijngeroeScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1

    while (true) {
      const url = `${CONFIG.baseUrl}/collections/all?page=${page}`
      console.log(`[dewijngoeroe] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[dewijngoeroe] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('div.product-item')

      if (items.length === 0) {
        console.log(`[dewijngoeroe] No products on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        // Producer from vendor link
        const producer = el.find('a.product-item__vendor').text().trim() || undefined

        // Name from product title link
        const name = el.find('a.product-item__title').text().trim()
        const relativeUrl = el.find('a.product-item__title').attr('href') ?? ''

        if (!name || !relativeUrl) continue

        const productUrl = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${CONFIG.baseUrl}${relativeUrl}`

        // Price from span.price text: "€99,95" or "€ 99,95"
        const priceText = el.find('.product-item__price-list .price').first().text().trim()
        const priceMatch = priceText.match(/(\d+)[,.](\d{2})/)
        const price = priceMatch
          ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
          : NaN
        if (isNaN(price) || price <= 0) continue

        // Check for sale/compare price
        const comparePriceText = el.find('.price--compare').text().trim()
        const comparePriceMatch = comparePriceText.match(/(\d+)[,.](\d{2})/)
        const originalPrice = comparePriceMatch
          ? parseFloat(`${comparePriceMatch[1]}.${comparePriceMatch[2]}`)
          : undefined

        // Image URL from lazy-loaded Shopify image (data-src with {width}x placeholder)
        let imageUrl: string | undefined
        const dataSrc = el.find('img.product-item__primary-image').attr('data-src')
        if (dataSrc) {
          // Replace {width}x with 400x for a reasonable size
          imageUrl = dataSrc.replace('{width}x', '400x')
          if (imageUrl.startsWith('//')) {
            imageUrl = `https:${imageUrl}`
          }
        }

        // Try to extract vintage from product name
        // Pattern: "Name 2020 - Producer - 75CL - 15,0% Vol."
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

      // Check for next page - Shopify uses ?page= pagination
      const hasNextPage = $('a[rel="next"], .pagination__next').length > 0
        || $(`a[href*="page=${page + 1}"]`).length > 0

      if (!hasNextPage || items.length < PER_PAGE) {
        break
      }

      page++
    }
  }
}
