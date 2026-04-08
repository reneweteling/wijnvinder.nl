/**
 * Vivino enricher: best-effort Vivino score enrichment for CanonicalWines.
 *
 * Strategy:
 * - Search Vivino's search API endpoint for the wine name
 * - Parse wine rating and metadata from JSON response
 * - Update CanonicalWine with vivinoScore, vivinoScoreCount, vivinoUrl, imageUrl
 * - 3s delays between requests to be polite
 * - Skip wines checked within the last 7 days
 */

import { db } from '@/lib/db/client'

const DELAY_MS = 3000
const SKIP_IF_CHECKED_WITHIN_DAYS = 7

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface VivinoWineResult {
  id: number
  name: string
  vintages?: {
    id: number
    year: number
    statistics?: {
      ratings_average?: number
      ratings_count?: number
    }
  }[]
  statistics?: {
    ratings_average?: number
    ratings_count?: number
  }
  link?: string
  image?: {
    variations?: {
      bottle_medium?: string
      bottle_large?: string
    }
  }
}

interface VivinoSearchResponse {
  wines?: VivinoWineResult[]
}

/**
 * Search Vivino for a wine by name and return the best match.
 */
async function searchVivino(
  query: string,
): Promise<VivinoWineResult | null> {
  const url = new URL('https://www.vivino.com/api/wines/search')
  url.searchParams.set('q', query)
  url.searchParams.set('limit', '5')

  let response: Response
  try {
    response = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,nl;q=0.8',
        Referer: 'https://www.vivino.com/',
      },
    })
  } catch (err) {
    console.warn(`[vivino] Network error searching for "${query}":`, err)
    return null
  }

  if (!response.ok) {
    console.warn(`[vivino] HTTP ${response.status} for query "${query}"`)
    return null
  }

  let data: VivinoSearchResponse
  try {
    data = (await response.json()) as VivinoSearchResponse
  } catch {
    console.warn(`[vivino] Failed to parse JSON for query "${query}"`)
    return null
  }

  const wines = data.wines ?? []
  return wines[0] ?? null
}

/**
 * Enrich a single CanonicalWine by canonicalWineId.
 * Fetches Vivino data and updates the DB record.
 */
export async function enrichWine(canonicalWineId: string): Promise<void> {
  const wine = await db.canonicalWine.findUnique({
    where: { id: canonicalWineId },
  })

  if (!wine) {
    console.warn(`[vivino] CanonicalWine ${canonicalWineId} not found`)
    return
  }

  // Skip if recently enriched
  if (wine.updatedAt) {
    const daysSinceUpdate =
      (Date.now() - wine.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceUpdate < SKIP_IF_CHECKED_WITHIN_DAYS && wine.vivinoScore != null) {
      console.log(
        `[vivino] Skipping "${wine.name}" — enriched ${Math.round(daysSinceUpdate)}d ago`,
      )
      return
    }
  }

  // Build search query from wine name and optional producer/vintage
  const queryParts: string[] = []
  // Use producer name from relation if available
  if (wine.producerId) {
    const producer = await db.producer.findUnique({ where: { id: wine.producerId }, select: { name: true } })
    if (producer) queryParts.push(producer.name)
  }
  queryParts.push(wine.name)
  if (wine.vintage) queryParts.push(String(wine.vintage))
  const query = queryParts.join(' ')

  console.log(`[vivino] Searching for: "${query}"`)

  const result = await searchVivino(query)

  if (!result) {
    console.log(`[vivino] No results for "${query}"`)
    return
  }

  // Extract rating — prefer vintages stats, fall back to wine-level stats
  let rating: number | undefined
  let ratingCount: number | undefined

  if (result.vintages && result.vintages.length > 0) {
    // Try to find matching vintage year first
    const matchingVintage = wine.vintage
      ? result.vintages.find((v) => v.year === wine.vintage)
      : null
    const targetVintage = matchingVintage ?? result.vintages[0]

    rating = targetVintage?.statistics?.ratings_average
    ratingCount = targetVintage?.statistics?.ratings_count
  }

  if (!rating && result.statistics) {
    rating = result.statistics.ratings_average
    ratingCount = result.statistics.ratings_count
  }

  if (!rating || rating <= 0) {
    console.log(`[vivino] No rating data for "${query}"`)
    return
  }

  // Build Vivino URL
  const vivinoUrl = result.link
    ? `https://www.vivino.com${result.link}`
    : undefined

  // Best image
  const imageUrl =
    result.image?.variations?.bottle_large ??
    result.image?.variations?.bottle_medium ??
    undefined

  await db.canonicalWine.update({
    where: { id: canonicalWineId },
    data: {
      vivinoScore: rating,
      vivinoScoreCount: ratingCount ?? null,
      vivinoUrl: vivinoUrl ?? null,
      ...(imageUrl && !wine.imageUrl ? { imageUrl } : {}),
    },
  })

  console.log(
    `[vivino] Enriched "${wine.name}": ${rating} (${ratingCount ?? '?'} ratings)`,
  )
}

/**
 * Enrich all CanonicalWines that haven't been enriched recently.
 * Runs sequentially with 3s delays between Vivino requests.
 */
export async function enrichAll(): Promise<void> {
  const cutoffDate = new Date(
    Date.now() - SKIP_IF_CHECKED_WITHIN_DAYS * 24 * 60 * 60 * 1000,
  )

  // Find wines without a score, or with a stale score
  const wines = await db.canonicalWine.findMany({
    where: {
      OR: [
        { vivinoScore: null },
        { updatedAt: { lt: cutoffDate } },
      ],
    },
    select: { id: true, name: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`[vivino] Enriching ${wines.length} wines...`)

  for (let i = 0; i < wines.length; i++) {
    const wine = wines[i]
    console.log(`[vivino] [${i + 1}/${wines.length}] ${wine.name}`)

    try {
      await enrichWine(wine.id)
    } catch (err) {
      console.error(`[vivino] Error enriching ${wine.id}:`, err)
    }

    // 3s delay between requests
    if (i < wines.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log('[vivino] Enrichment complete')
}
