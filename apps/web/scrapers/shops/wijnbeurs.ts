/**
 * Scraper for wijnbeurs.nl (Magento-based store, same platform as wijnvoordeel).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products are <li class="item product product-item">
 * - Name: a.product-item-link (anchor text)
 * - URL:  a.product-item-link href
 * - Image: img.product-image-photo src
 * - Final price: [data-price-type="finalPrice"] data-price-amount
 * - Original price: [data-price-type="oldPrice"] data-price-amount
 * - Vintage + country + region: .product-item-details-top .small
 *   e.g. "2024 | Frankrijk | Pays d'Oc"
 * - Pagination: ?p=2&product_list_limit=96
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'
import { normalizeCountry } from '../country-map'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'wijnbeurs')!

export class WijnbeursScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1
    const perPage = 96

    while (true) {
      const url = `${CONFIG.baseUrl}/wijn?product_list_limit=${perPage}&p=${page}`
      console.log(`[wijnbeurs] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[wijnbeurs] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('li.item.product.product-item')

      if (items.length === 0) {
        console.log(`[wijnbeurs] No products on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        const name = el.find('a.product-item-link').text().trim()
        const productUrl = el.find('a.product-item-link').attr('href') ?? ''
        // Wijnbeurs has multiple product-image-photo per item:
        // 1st = rating badge (proefpanelpunten/hamersma), 2nd = actual bottle
        // Filter out badges and placeholders to find the real bottle image
        let imageUrl: string | undefined
        const allImgs = el.find('img.product-image-photo')
        for (let j = 0; j < allImgs.length; j++) {
          const img = allImgs.eq(j)
          const src = img.attr('data-src') ?? img.attr('src') ?? ''
          // Skip rating badges and placeholders
          if (src.includes('proefpanelpunten') || src.includes('hamersma') ||
              src.includes('trophy') || src.includes('catavinum') ||
              src.includes('berliner') || src.includes('punten') ||
              src.includes('medaille') || src.includes('award') ||
              src.includes('luca-maroni') || src.includes('luca_maroni') ||
              src.includes('vivino') || src.includes('gilbert') ||
              src.includes('gaillard') || src.includes('hires_') ||
              src.includes('/static/version') || src.includes('placeholder') ||
              src.includes('pixel.png')) {
            continue
          }
          // Skip small square images (badges are typically 160x160)
          const maxW = img.attr('max-width')
          if (maxW && parseInt(maxW) <= 160) continue
          if (src.includes('/media/catalog/product/')) {
            // Strip Magento resize params to get full-resolution image
            imageUrl = src.split('?')[0]
            break
          }
        }

        if (!name || !productUrl) continue

        // Final price (special price if on sale, otherwise regular)
        const priceAttr = el
          .find('[data-price-type="finalPrice"]')
          .attr('data-price-amount')
        const price = priceAttr ? parseFloat(priceAttr) : NaN

        if (isNaN(price) || price <= 0) continue

        // Original price (before sale)
        const originalPriceAttr = el
          .find('[data-price-type="oldPrice"]')
          .attr('data-price-amount')
        const originalPrice = originalPriceAttr
          ? parseFloat(originalPriceAttr)
          : undefined

        // Vintage, country, region from ".small" e.g. "2024 | Frankrijk | Pays d'Oc"
        const smallText = el.find('.product-item-details-top .small').text().trim()
        let vintage: number | undefined
        let country: string | undefined
        let region: string | undefined

        if (smallText) {
          const parts = smallText.split('|').map((p) => p.trim())
          let countryFound = false

          for (const part of parts) {
            const yearMatch = part.match(/\b(19\d{2}|20\d{2})\b/)
            if (yearMatch) {
              vintage = parseInt(yearMatch[1], 10)
            } else if (!countryFound) {
              const mapped = normalizeCountry(part)
              if (mapped) {
                country = mapped
                countryFound = true
              }
            } else {
              // Third non-year part after country is the region
              if (part.length > 1) region = part
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
          imageUrl,
          price,
          originalPrice,
          vintage,
          country,
          region,
          rating,
        }
      }

      // Check for next page link
      const hasNextPage = $('a.action.next').length > 0
        || $(`link[rel="next"]`).length > 0

      if (!hasNextPage || items.length < perPage) {
        break
      }

      page++
    }
  }
}
