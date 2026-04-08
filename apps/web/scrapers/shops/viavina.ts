/**
 * Scraper for viavina.nl (WooCommerce / WordPress).
 *
 * HTML structure observed from live fetch (2026-04):
 * - Products: <li class="product type-product ...">
 * - Name: h2.woocommerce-loop-product__title
 * - URL: a.woocommerce-LoopProduct-link href
 * - Image: img.attachment-woocommerce_thumbnail src
 * - Price: span.woocommerce-Price-amount bdi text (e.g. "€ 65,95")
 * - Wine type inferred from product_cat classes (rode-wijnen, witte-wijnen, rose-wijnen, cava)
 * - Pagination: /shop/page/2/ etc.
 * - Small catalog (~10 products), all organic wines from Spain
 */

import type { ScrapedWine, WineType } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'viavina')!

function inferTypeFromClasses(classes: string): WineType | undefined {
  if (classes.includes('rode-wijnen') || classes.includes('product_cat-rode')) return 'red'
  if (classes.includes('witte-wijnen') || classes.includes('product_cat-witte')) return 'white'
  if (classes.includes('rose-wijnen') || classes.includes('product_cat-rose')) return 'rose'
  if (classes.includes('cava') || classes.includes('mousserende')) return 'sparkling'
  return undefined
}

export class ViavinaScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1

    while (true) {
      const url = page === 1
        ? `${CONFIG.baseUrl}/shop/`
        : `${CONFIG.baseUrl}/shop/page/${page}/`
      console.log(`[viavina] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[viavina] Failed to fetch page ${page}:`, err)
        break
      }

      const items = $('li.product.type-product')

      if (items.length === 0) {
        console.log(`[viavina] No products on page ${page}, stopping`)
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)
        const classes = el.attr('class') ?? ''

        // Skip non-wine products (e.g. "inspiratiebox" gift box)
        if (classes.includes('product_cat-overige')) continue

        const name = el.find('h2.woocommerce-loop-product__title').text().trim()
        const productUrl = el.find('a.woocommerce-LoopProduct-link').attr('href') ?? ''

        if (!name || !productUrl) continue

        // Image
        const imageUrl = el.find('img.attachment-woocommerce_thumbnail').attr('src')
          ?? el.find('img').first().attr('src')
          ?? undefined

        // Price from WooCommerce price markup: "€ 65,95" or "€ 8,95 – € 65,95"
        const priceText = el.find('.woocommerce-Price-amount bdi').first().text().trim()
        const priceMatch = priceText.match(/(\d+)[,.](\d{2})/)
        const price = priceMatch
          ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
          : NaN
        if (isNaN(price) || price <= 0) continue

        // Wine type from CSS class
        const wineType = inferTypeFromClasses(classes)

        // Viavina wines are all from Spain (organic Spanish wines)
        const country = 'Spanje'

        yield {
          name,
          url: productUrl,
          imageUrl,
          price,
          country,
          type: wineType,
        }
      }

      // Check for next page
      const hasNextPage = $('a.next.page-numbers').length > 0

      if (!hasNextPage) {
        break
      }

      page++
    }
  }
}
