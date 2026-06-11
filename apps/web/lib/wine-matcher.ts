/**
 * Wine matcher: fuzzy-matches scraped wines to canonical wine records.
 * Uses string-similarity-js (Sørensen–Dice coefficient).
 * Threshold 0.9 → auto-match; below → create new CanonicalWine.
 */

import { stringSimilarity } from 'string-similarity-js'
import { db } from '@/lib/db/client'
import type { ScrapedWine } from '@/lib/types'
import { classifyWineType } from '@/scrapers/normalize'
import type { NormalizedWine } from '@/scrapers/normalize'

const MATCH_THRESHOLD = 0.9

/**
 * In-memory producer cache for the current scrape run.
 * Maps producer name → producer id, so we avoid a findUnique DB call per wine.
 * Cleared between scrape runs by process restart (worker is short-lived).
 */
const producerCache = new Map<string, string>()

/**
 * Find or create a CanonicalWine for a scraped wine.
 * Returns the canonicalWineId.
 */
export async function matchOrCreate(
  scraped: ScrapedWine,
  normalized: NormalizedWine,
): Promise<string> {
  // Search candidates by searchName similarity using existing DB records
  // We fetch wines with similar first characters to narrow the search space
  const prefix = normalized.searchName.substring(0, 4)

  const candidates = await db.canonicalWine.findMany({
    where: {
      searchName: {
        contains: prefix,
      },
    },
    select: {
      id: true,
      searchName: true,
      vintage: true,
    },
  })

  // Score each candidate
  let bestId: string | null = null
  let bestScore = 0

  for (const candidate of candidates) {
    let score = stringSimilarity(normalized.searchName, candidate.searchName)

    // Penalize vintage mismatch
    if (normalized.vintage && candidate.vintage) {
      if (normalized.vintage !== candidate.vintage) {
        score *= 0.5
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestId = candidate.id
    }
  }

  if (bestScore >= MATCH_THRESHOLD && bestId) {
    return bestId
  }

  // No good match — create a new CanonicalWine.
  // classifyWineType is the canonical layer: sparkling/rosé/dessert/red/white keywords
  // in the name override a wrong category hint from the scraper.
  const rawType = scraped.type ?? null
  const wineType = classifyWineType(scraped.name, rawType)
  const wineName = normalized.name || scraped.name
  // Prefer scraper-provided producer (explicit) over normalized (guessed from name)
  const producerName = scraped.producer || normalized.producer || null
  const vintage = normalized.vintage ?? scraped.vintage ?? null
  const slug = generateSlug(producerName, wineName, vintage)

  // Find or create Producer — use in-memory cache to avoid a DB round-trip per wine
  let producerId: string | null = null
  if (producerName) {
    const cached = producerCache.get(producerName)
    if (cached) {
      producerId = cached
    } else {
      const producerSlug = generateSlug(null, producerName, null)
      const existingProducer = await db.producer.findUnique({ where: { name: producerName } })
      if (existingProducer) {
        producerId = existingProducer.id
      } else {
        const newProducer = await db.producer.create({
          data: {
            slug: producerSlug,
            name: producerName,
            country: scraped.country ?? null,
            region: scraped.region ?? null,
          },
        })
        producerId = newProducer.id
      }
      producerCache.set(producerName, producerId)
    }
  }

  const created = await db.canonicalWine.create({
    data: {
      slug,
      name: wineName,
      ...(producerId ? { producer: { connect: { id: producerId } } } : {}),
      grape: scraped.grape ?? null,
      grapes: scraped.grape ? [scraped.grape] : [],
      country: scraped.country ?? null,
      region: scraped.region ?? null,
      wineType: wineType ?? null,
      vintage,
      searchName: normalized.searchName,
      imageUrl: scraped.imageUrl ?? null,
      vivinoScore: scraped.rating ?? null,
    },
  })

  return created.id
}

/** Generate a URL-friendly slug from producer, wine name, and vintage */
function generateSlug(producer: string | null, name: string, vintage: number | null): string {
  const parts = [producer, name, vintage ? String(vintage) : null].filter(Boolean)
  let slug = parts
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  // Append random suffix to avoid collisions
  slug += '-' + Math.random().toString(36).substring(2, 6)
  return slug
}

