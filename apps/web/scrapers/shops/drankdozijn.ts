/**
 * Scraper for drankdozijn.nl (Elasticsearch JSON API).
 *
 * DrankDozijn is a Vue.js SPA that loads products from es-api.drankdozijn.nl.
 * We call the API directly — no HTML parsing needed.
 *
 * API: GET https://es-api.drankdozijn.nl/products?group=wijn&lang=nl-nl&listLength=100&pagina=1
 * Returns: JSON array of product objects with rich metadata (name, brand, country, grape, vintage, price, images).
 */

import type { ScrapedWine, WineType } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { BaseScraper } from '../base-scraper'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'drankdozijn')!

const API_URL = 'https://es-api.drankdozijn.nl/products'
const PAGE_SIZE = 100
const IMAGE_BASE = 'https://res.cloudinary.com/boozeboodcdn/image/upload/f_auto,q_auto/v1/products'

interface DrankDozijnProduct {
  description: string
  alias: string
  price: number
  salePrice: number | null
  availability: string
  brandDescription: string
  images: string[]
  features: { alias: string; value: { alias: string; description: string } }[]
}

function getFeature(product: DrankDozijnProduct, featureAlias: string): string | undefined {
  return product.features.find((f) => f.alias === featureAlias)?.value?.description
}

function inferWineType(category: string | undefined): WineType | undefined {
  if (!category) return undefined
  const lower = category.toLowerCase()
  if (lower.includes('rood') || lower.includes('rode')) return 'red'
  if (lower.includes('wit')) return 'white'
  if (lower.includes('rosé') || lower.includes('rose')) return 'rose'
  if (lower.includes('mousse') || lower.includes('champagne') || lower.includes('cava') || lower.includes('prosecco')) return 'sparkling'
  if (lower.includes('port') || lower.includes('dessert') || lower.includes('sherry')) return 'dessert'
  return undefined
}

export class DrankDozijnScraper extends BaseScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    let page = 1
    const seenAliases = new Set<string>()

    while (true) {
      const url = `${API_URL}?group=wijn&lang=nl-nl&listLength=${PAGE_SIZE}&pagina=${page}`
      console.log(`[drankdozijn] Fetching API page ${page}`)

      let products: DrankDozijnProduct[]
      try {
        const response = await fetch(url, {
          headers: {
            'Origin': 'https://drankdozijn.nl',
            'Referer': 'https://drankdozijn.nl/groep/wijn',
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          console.error(`[drankdozijn] API returned ${response.status}`)
          break
        }

        products = await response.json() as DrankDozijnProduct[]
      } catch (err) {
        console.error(`[drankdozijn] Failed to fetch API page ${page}:`, err)
        break
      }

      if (products.length === 0) {
        console.log(`[drankdozijn] No products on page ${page}, stopping`)
        break
      }

      // Detect API wraparound: if all products on this page were already seen, stop
      const newProducts = products.filter((p) => !seenAliases.has(p.alias))
      if (newProducts.length === 0) {
        console.log(`[drankdozijn] Page ${page} contains only duplicates, stopping`)
        break
      }

      for (const product of products) {
        if (seenAliases.has(product.alias)) continue
        seenAliases.add(product.alias)
        if (!product.description || !product.alias) continue
        if (product.availability !== 'available') continue

        const price = product.salePrice ?? product.price
        if (!price || price <= 0) continue

        const originalPrice = product.salePrice != null && product.price > product.salePrice
          ? product.price : undefined

        const imageUrl = product.images?.[0]
          ? `${IMAGE_BASE}/${product.images[0]}`
          : undefined

        const category = getFeature(product, 'categorie')
        const country = getFeature(product, 'land')
        const grape = getFeature(product, 'druif')
        const region = getFeature(product, 'regio')
        const vintageStr = getFeature(product, 'vintage')
        const vintage = vintageStr ? parseInt(vintageStr.replace(/\D/g, ''), 10) || undefined : undefined

        yield {
          name: product.description,
          producer: product.brandDescription || undefined,
          url: `${CONFIG.baseUrl}/artikel/${product.alias}`,
          imageUrl,
          price,
          originalPrice,
          country: country || undefined,
          region: region || undefined,
          grape: grape || undefined,
          vintage,
          type: inferWineType(category),
        }
      }

      if (products.length < PAGE_SIZE) {
        break
      }

      page++
    }
  }
}
