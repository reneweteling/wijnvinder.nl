/**
 * Scraper for drankdozijn.nl (Vue.js SPA backed by custom API).
 *
 * NOTE: DrankDozijn loads product data client-side via Vue.js app.
 * The server-rendered HTML at /groep/wijn contains empty containers.
 * This scraper may need Playwright for full JS rendering.
 *
 * Observed structure (2026-04):
 * - Wine category URL: /groep/wijn
 * - Products rendered via Vue.js with data from es-api.drankdozijn.nl
 * - Product tiles have: .product class with name, price, image, URL
 * - Pagination: ?page=1&limit=48
 */

import type { ScrapedWine } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'
import { normalizeCountry } from '../country-map'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'drankdozijn')!

const PAGE_SIZE = 48

export class DrankDozijnScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1

    while (true) {
      const url = `${CONFIG.baseUrl}/groep/wijn?page=${page}&limit=${PAGE_SIZE}`
      console.log(`[drankdozijn] Fetching page ${page}: ${url}`)

      let $
      try {
        $ = await this.fetchPage(url)
      } catch (err) {
        console.error(`[drankdozijn] Failed to fetch page ${page}:`, err)
        break
      }

      // NOTE: DrankDozijn is a Vue.js SPA. The server-rendered HTML may not
      // contain product data. If no products are found, this scraper will
      // need to be upgraded to use Playwright for JS rendering.
      const items = $('div.product, article.product, .product-item, .product-card')

      if (items.length === 0) {
        // Try to find product data in embedded JSON or script tags
        const scriptData = $('script').filter((_i, el) => {
          const text = $(el).text()
          return text.includes('products') || text.includes('GProducts')
        })

        if (scriptData.length === 0) {
          console.log(
            `[drankdozijn] No products found on page ${page}. ` +
            `Site requires JavaScript rendering (Vue.js SPA). ` +
            `Consider upgrading to Playwright.`
          )
          break
        }

        // Try to extract product data from script tags
        for (let i = 0; i < scriptData.length; i++) {
          const scriptText = $(scriptData[i]).text()
          // Look for JSON product arrays in the script
          const jsonMatch = scriptText.match(/products\s*[:=]\s*(\[[\s\S]*?\])\s*[,;}\n]/)
          if (jsonMatch) {
            try {
              const products = JSON.parse(jsonMatch[1])
              for (const product of products) {
                if (!product.name || !product.price) continue
                const productUrl = product.url?.startsWith('http')
                  ? product.url
                  : `${CONFIG.baseUrl}${product.url || ''}`

                yield {
                  name: product.name,
                  url: productUrl,
                  imageUrl: product.image || product.imageUrl,
                  price: typeof product.price === 'number' ? product.price : parseFloat(product.price),
                  country: product.country ? normalizeCountry(product.country) : undefined,
                  vintage: product.vintage ? parseInt(String(product.vintage), 10) : undefined,
                  producer: product.brand || product.producer,
                }
              }
            } catch {
              // JSON parsing failed, continue
            }
          }
        }
        break
      }

      for (let i = 0; i < items.length; i++) {
        const el = items.eq(i)

        const name = el.find('.product-name, .product-title, h3, h4').first().text().trim()
        if (!name) continue

        const relativeUrl = el.find('a').first().attr('href') ?? ''
        const productUrl = relativeUrl.startsWith('http')
          ? relativeUrl
          : `${CONFIG.baseUrl}${relativeUrl}`
        if (!productUrl || productUrl === CONFIG.baseUrl) continue

        // Price
        const priceText = el.find('.product-price, .price').first().text().trim()
        const priceMatch = priceText.match(/(\d+)[,.](\d{2})/)
        const price = priceMatch
          ? parseFloat(`${priceMatch[1]}.${priceMatch[2]}`)
          : NaN
        if (isNaN(price) || price <= 0) continue

        // Image
        const imageUrl = el.find('img').first().attr('src')
          ?? el.find('img').first().attr('data-src')
          ?? undefined

        // Country
        const countryText = el.find('.country, .product-country').text().trim()
        const country = countryText ? normalizeCountry(countryText) : undefined

        yield {
          name,
          url: productUrl,
          imageUrl,
          price,
          country,
        }
      }

      if (items.length < PAGE_SIZE) {
        break
      }

      page++
    }
  }
}
