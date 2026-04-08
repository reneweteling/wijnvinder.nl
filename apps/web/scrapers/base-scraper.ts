/**
 * Abstract base class for all wine shop scrapers.
 *
 * Responsibilities:
 * - Create ScrapeJob record (status: "running")
 * - Iterate scrapeAll() async generator
 * - Normalize each wine, fuzzy-match to CanonicalWine, upsert ShopListing
 * - Mark previously-seen listings that weren't yielded as unavailable
 * - Update ScrapeJob on completion or failure
 */

import { db } from '@/lib/db/client'
import type { ScrapedWine, ShopConfig } from '@/lib/types'
import { normalizeWineName } from './normalize'
import { matchOrCreate } from '@/lib/wine-matcher'

/** Known badge/award image patterns that should never be used as wine bottle images */
const BADGE_IMAGE_PATTERNS = [
  'proefpanelpunten', 'hamersma', 'trophy', 'catavinum', 'berliner',
  'medaille', 'award', 'punten', 'luca-maroni', 'luca_maroni',
  'vivino', 'gilbert', 'gaillard', 'hires_', 'pixel.png',
  'placeholder', '/static/version',
]

/** Returns true if the image URL looks like a rating badge rather than a wine bottle */
function isBadgeImage(url: string): boolean {
  const lower = url.toLowerCase()
  return BADGE_IMAGE_PATTERNS.some(p => lower.includes(p))
}

/** Clean imageUrl: return null if it's a badge */
function cleanImageUrl(url: string | undefined): string | null {
  if (!url) return null
  return isBadgeImage(url) ? null : url
}

export abstract class BaseScraper {
  protected readonly config: ShopConfig

  constructor(config: ShopConfig) {
    this.config = config
  }

  /**
   * Yield all scraped wines from the shop.
   * Implementations should handle pagination internally.
   */
  abstract scrapeAll(): AsyncGenerator<ScrapedWine>

  /**
   * Run the full scraping pipeline:
   * 1. Create ScrapeJob
   * 2. Iterate scrapeAll()
   * 3. Normalize + match/create CanonicalWine
   * 4. Upsert ShopListing
   * 5. Mark unseen listings unavailable
   * 6. Update ScrapeJob
   */
  async run(): Promise<void> {
    const job = await db.scrapeJob.create({
      data: {
        shopSlug: this.config.slug,
        status: 'running',
        startedAt: new Date(),
      },
    })

    console.log(`[${this.config.slug}] ScrapeJob ${job.id} started`)

    const seenUrls = new Set<string>()
    let listingsFound = 0
    let listingsMatched = 0

    try {
      for await (const scraped of this.scrapeAll()) {
        listingsFound++
        seenUrls.add(scraped.url)

        try {
          const normalized = normalizeWineName(scraped.name)
          // Clean the image URL — reject known badge/award images
          const validImageUrl = cleanImageUrl(scraped.imageUrl)
          const canonicalWineId = await matchOrCreate(
            { ...scraped, imageUrl: validImageUrl ?? undefined },
            normalized,
          )
          listingsMatched++

          // Upsert ShopListing by (shopSlug, url)
          await db.shopListing.upsert({
            where: {
              shopSlug_url: {
                shopSlug: this.config.slug,
                url: scraped.url,
              },
            },
            create: {
              canonicalWineId,
              shopSlug: this.config.slug,
              shopName: this.config.name,
              price: scraped.price,
              originalPrice: scraped.originalPrice ?? null,
              url: scraped.url,
              available: true,
              imageUrl: validImageUrl,
              rawName: scraped.name,
              rawProducer: scraped.producer ?? null,
              rating: scraped.rating ?? null,
              description: scraped.description ?? null,
              lastScrapedAt: new Date(),
            },
            update: {
              canonicalWineId,
              price: scraped.price,
              originalPrice: scraped.originalPrice ?? null,
              available: true,
              imageUrl: validImageUrl,
              rawName: scraped.name,
              rawProducer: scraped.producer ?? null,
              rating: scraped.rating ?? null,
              description: scraped.description ?? null,
              lastScrapedAt: new Date(),
            },
          })

          // Update canonical wine with better image, aggregate rating, and description
          const needsCanonicalCheck =
            validImageUrl != null ||
            scraped.rating != null ||
            scraped.description != null

          if (needsCanonicalCheck) {
            const canonical = await db.canonicalWine.findUnique({
              where: { id: canonicalWineId },
              select: { imageUrl: true, vivinoScore: true, description: true },
            })
            const updates: Record<string, unknown> = {}

            // Prefer a real product image over placeholders / badges / Unsplash
            if (
              validImageUrl &&
              (!canonical?.imageUrl ||
                isBadgeImage(canonical.imageUrl) ||
                canonical.imageUrl.includes('unsplash.com'))
            ) {
              updates.imageUrl = validImageUrl
            }

            // Set vivinoScore from tasting panel rating only when no Vivino score exists yet
            if (scraped.rating != null && canonical?.vivinoScore == null) {
              updates.vivinoScore = scraped.rating
            }

            // Propagate description to canonical wine if it doesn't have one yet
            if (scraped.description && !canonical?.description) {
              updates.description = scraped.description
            }

            if (Object.keys(updates).length > 0) {
              await db.canonicalWine.update({
                where: { id: canonicalWineId },
                data: updates,
              })
            }
          }

          console.log(
            `[${this.config.slug}] ${listingsFound} scraped: ${scraped.name} @ €${scraped.price}`,
          )
        } catch (err) {
          console.error(
            `[${this.config.slug}] Failed to process listing "${scraped.name}":`,
            err,
          )
        }
      }

      // Mark listings not seen in this run as unavailable
      await this.markUnseen(seenUrls)

      await db.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          listingsFound,
          listingsMatched,
          completedAt: new Date(),
        },
      })

      console.log(
        `[${this.config.slug}] Job ${job.id} completed: ${listingsFound} found, ${listingsMatched} matched`,
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)

      await db.scrapeJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          listingsFound,
          listingsMatched,
          error: errorMessage,
          completedAt: new Date(),
        },
      })

      console.error(`[${this.config.slug}] Job ${job.id} failed:`, err)
      throw err
    }
  }

  /**
   * Mark all ShopListings for this shop whose URL was not scraped
   * in the current run as unavailable.
   */
  private async markUnseen(seenUrls: Set<string>): Promise<void> {
    if (seenUrls.size === 0) return

    // Fetch all active listings for this shop
    const activeListings = await db.shopListing.findMany({
      where: {
        shopSlug: this.config.slug,
        available: true,
      },
      select: { id: true, url: true },
    })

    const unseenIds = activeListings
      .filter((l) => !seenUrls.has(l.url))
      .map((l) => l.id)

    if (unseenIds.length > 0) {
      await db.shopListing.updateMany({
        where: { id: { in: unseenIds } },
        data: { available: false },
      })

      console.log(
        `[${this.config.slug}] Marked ${unseenIds.length} listings as unavailable`,
      )
    }
  }
}
