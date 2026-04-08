/**
 * Scraper for drinkheroes.nl (Magento 2 with headless Next.js/PWA frontend).
 *
 * Observed from live fetch (2026-04):
 * - Frontend is a headless PWA (Next.js) that renders everything client-side
 * - Backend is Magento 2 with a GraphQL API at /graphql
 * - Products can be fetched via Magento GraphQL queries
 * - No server-rendered product HTML available
 *
 * This scraper uses the Magento GraphQL API directly instead of HTML parsing.
 * It extends CheerioScraper for rate-limiting but performs JSON requests.
 */

import type { ScrapedWine, WineType } from '@/lib/types'
import { SHOP_CONFIGS } from '@/lib/constants'
import { CheerioScraper } from '../cheerio-scraper'
import { normalizeCountry } from '../country-map'

const CONFIG = SHOP_CONFIGS.find((s) => s.slug === 'drinkheroes')!

const PAGE_SIZE = 48

// GraphQL query to fetch wine products
const PRODUCTS_QUERY = `
query getProducts($currentPage: Int!, $pageSize: Int!, $filter: ProductAttributeFilterInput) {
  products(
    filter: $filter
    pageSize: $pageSize
    currentPage: $currentPage
    sort: { position: ASC }
  ) {
    total_count
    items {
      name
      sku
      url_key
      price_range {
        minimum_price {
          final_price { value }
          regular_price { value }
        }
      }
      small_image { url }
      ... on SimpleProduct {
        country_of_origin: country_of_manufacture
      }
    }
    page_info {
      current_page
      total_pages
    }
  }
}
`

// Wine category UIDs from Magento GraphQL categories query.
// Parent "Wijn" category (ODQ3) contains all subcategories:
//   Rode Wijn (ODQ4), Witte Wijn (ODQ5), Rosé Wijn (ODUw), Dessert Wijn (ODUx)
// Using the parent UID returns all wines at once (456+ products).
const WINE_CATEGORY_UIDS = ['ODQ3']

interface GraphQLProduct {
  name: string
  sku: string
  url_key: string
  price_range: {
    minimum_price: {
      final_price: { value: number }
      regular_price: { value: number }
    }
  }
  small_image?: { url: string }
  country_of_origin?: string
}

interface GraphQLResponse {
  data: {
    products: {
      total_count: number
      items: GraphQLProduct[]
      page_info: {
        current_page: number
        total_pages: number
      }
    }
  }
}

function inferWineType(name: string): WineType | undefined {
  const lower = name.toLowerCase()
  if (lower.includes('rosé') || lower.includes('rose')) return 'rose'
  if (lower.includes('mousserende') || lower.includes('champagne') ||
      lower.includes('prosecco') || lower.includes('cava') ||
      lower.includes('crémant') || lower.includes('cremant') ||
      lower.includes('sparkling') || lower.includes('brut')) return 'sparkling'
  if (lower.includes('rood') || lower.includes('rode') || lower.includes('red') ||
      lower.includes('tinto') || lower.includes('rouge')) return 'red'
  if (lower.includes('wit') || lower.includes('witte') || lower.includes('white') ||
      lower.includes('blanc') || lower.includes('bianco')) return 'white'
  return undefined
}

export class DrinkHeroesScraper extends CheerioScraper {
  constructor() {
    super(CONFIG)
  }

  async *scrapeAll(): AsyncGenerator<ScrapedWine> {
    for (const categoryUid of WINE_CATEGORY_UIDS) {
      yield* this.scrapeByCategory(categoryUid)
    }
  }

  private async *scrapeByCategory(categoryUid: string): AsyncGenerator<ScrapedWine> {
    let currentPage = 1

    while (true) {
      console.log(`[drinkheroes] Fetching GraphQL page ${currentPage} for category "${categoryUid}"`)

      let response: GraphQLResponse
      try {
        const result = await this.fetchGraphQL(currentPage, categoryUid)
        response = result
      } catch (err) {
        console.error(`[drinkheroes] GraphQL request failed on page ${currentPage}:`, err)
        break
      }

      const { items, page_info, total_count } = response.data.products

      if (items.length === 0) {
        console.log(`[drinkheroes] No products on page ${currentPage}, stopping`)
        break
      }

      console.log(`[drinkheroes] Got ${items.length} products (${total_count} total)`)

      for (const item of items) {
        if (!item.name || !item.price_range) continue

        const finalPrice = item.price_range.minimum_price.final_price.value
        const regularPrice = item.price_range.minimum_price.regular_price.value

        if (finalPrice <= 0) continue

        const productUrl = `${CONFIG.baseUrl}/nl/${item.url_key}`

        // Extract vintage from product name
        let vintage: number | undefined
        const vintageMatch = item.name.match(/\b(19\d{2}|20\d{2})\b/)
        if (vintageMatch) {
          vintage = parseInt(vintageMatch[1], 10)
        }

        // Country
        const country = item.country_of_origin
          ? normalizeCountry(item.country_of_origin)
          : undefined

        // Wine type
        const wineType = inferWineType(item.name)

        yield {
          name: item.name,
          url: productUrl,
          imageUrl: item.small_image?.url,
          price: finalPrice,
          originalPrice: regularPrice > finalPrice ? regularPrice : undefined,
          vintage,
          country,
          type: wineType,
        }
      }

      if (currentPage >= page_info.total_pages) {
        break
      }

      currentPage++
    }
  }

  private async fetchGraphQL(
    currentPage: number,
    categoryUid: string,
  ): Promise<GraphQLResponse> {
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000))

    const body = JSON.stringify({
      query: PRODUCTS_QUERY,
      variables: {
        currentPage,
        pageSize: PAGE_SIZE,
        filter: {
          category_uid: { eq: categoryUid },
        },
      },
    })

    const response = await fetch(`${CONFIG.baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      body,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }

    return response.json() as Promise<GraphQLResponse>
  }
}
