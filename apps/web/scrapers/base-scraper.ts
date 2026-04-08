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
import { QueueClient } from '@/lib/queue/client'
import { JobType } from '@/lib/queue/types'

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
  private shopId!: string

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
    const shop = await db.shop.findUniqueOrThrow({ where: { slug: this.config.slug } })
    this.shopId = shop.id

    const job = await db.scrapeJob.create({
      data: {
        shopId: shop.id,
        status: 'running',
        startedAt: new Date(),
      },
    })

    console.log(`[${this.config.slug}] ScrapeJob ${job.id} started`)

    // Pre-fetch existing listings for change detection
    const existingListings = await db.shopListing.findMany({
      where: { shopId: this.shopId },
      select: { url: true, rawName: true, price: true, description: true },
    })
    const existingByUrl = new Map(existingListings.map(l => [l.url, l]))

    const seenUrls = new Set<string>()
    let listingsFound = 0
    let listingsMatched = 0
    let enrichQueued = 0

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

          // Upsert ShopListing by (shopId, url)
          await db.shopListing.upsert({
            where: {
              shopId_url: {
                shopId: this.shopId,
                url: scraped.url,
              },
            },
            create: {
              canonicalWineId,
              shopId: this.shopId,
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

          // Update canonical wine with rating, thumbnail, and any scraped description
          const canonical = await db.canonicalWine.findUnique({
            where: { id: canonicalWineId },
            select: { imageUrl: true, vivinoScore: true, description: true },
          })
          const updates: Record<string, unknown> = {}

          if (scraped.rating != null && canonical?.vivinoScore == null) {
            updates.vivinoScore = scraped.rating
          }
          if (validImageUrl && !canonical?.imageUrl) {
            updates.imageUrl = validImageUrl
          }
          if (scraped.description && !canonical?.description) {
            updates.description = scraped.description
          }

          if (Object.keys(updates).length > 0) {
            await db.canonicalWine.update({
              where: { id: canonicalWineId },
              data: updates,
            })
          }

          // Enqueue enrichment job if listing is new/changed and needs detail page data
          if (!scraped.description) {
            const existing = existingByUrl.get(scraped.url)
            const isNew = !existing
            const hasChanged = existing && (existing.rawName !== scraped.name || existing.price !== scraped.price)
            const needsEnrichment = !canonical?.description || !canonical?.imageUrl || canonical.imageUrl.includes('unsplash.com')

            if (isNew || hasChanged || needsEnrichment) {
              await QueueClient.enqueue(
                JobType.ENRICH_LISTING,
                {
                  shopSlug: this.config.slug,
                  shopId: this.shopId,
                  listingUrl: scraped.url,
                  canonicalWineId,
                },
                { singletonKey: scraped.url, retryLimit: 2 },
              )
              enrichQueued++
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
        `[${this.config.slug}] Job ${job.id} completed: ${listingsFound} found, ${listingsMatched} matched, ${enrichQueued} enrichment jobs queued`,
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
        shopId: this.shopId,
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
