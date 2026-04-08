#!/usr/bin/env node

/**
 * CLI entry point for the scraping infrastructure.
 *
 * Usage:
 *   pnpm scrape --shop=wijnvoordeel         Enqueue a scrape job via pg-boss
 *   pnpm scrape --shop=wijnvoordeel --direct Run scraper inline (no pg-boss)
 *   pnpm scrape --all                        Enqueue one job per enabled shop
 *   pnpm scrape --all --direct               Run all enabled shops inline
 *   pnpm scrape --enrich                     Run Vivino enrichment for all wines
 *   pnpm scrape --enrich --wine=<id>         Enrich a single canonical wine
 */

import { SHOP_CONFIGS } from '@/lib/constants'
import { getScraperForShop, ALL_SHOP_SLUGS } from './shops/index'
import { enrichAll, enrichWine } from './vivino-enricher'
import { enrichDescriptions } from './enrich-descriptions'
import { QueueClient } from '@/lib/queue/client'
import { JobType } from '@/lib/queue/types'

function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {}
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=')
      if (eqIdx > 0) {
        const key = arg.slice(2, eqIdx)
        const value = arg.slice(eqIdx + 1)
        args[key] = value
      } else {
        const key = arg.slice(2)
        args[key] = true
      }
    }
  }
  return args
}

function printUsage(): void {
  console.log(`
Wine Scraper CLI
================

Usage:
  pnpm scrape --shop=<slug>            Enqueue scrape job via pg-boss (default)
  pnpm scrape --shop=<slug> --direct   Run scraper inline (bypass pg-boss)
  pnpm scrape --all                    Enqueue one job per enabled shop
  pnpm scrape --all --direct           Run all enabled shops inline
  pnpm scrape --enrich                 Run Vivino enrichment for all wines
  pnpm scrape --enrich --wine=<id>     Enrich a single canonical wine by ID

Available shops:
${ALL_SHOP_SLUGS.map((s) => `  - ${s}`).join('\n')}
`)
}

async function enqueueShop(slug: string): Promise<void> {
  const shopConfig = SHOP_CONFIGS.find((s) => s.slug === slug)
  if (!shopConfig) {
    console.error(`[scraper] Unknown shop slug: "${slug}"`)
    console.error(`Available: ${ALL_SHOP_SLUGS.join(', ')}`)
    process.exit(1)
  }

  if (!shopConfig.enabled) {
    console.warn(`[scraper] Shop "${slug}" is disabled, skipping`)
    return
  }

  const jobId = await QueueClient.enqueue(JobType.SCRAPE_SHOP, { shopSlug: slug })
  console.log(`[scraper] Enqueued SCRAPE_SHOP job for "${slug}" (jobId: ${jobId})`)
}

async function runShopDirect(slug: string): Promise<void> {
  const shopConfig = SHOP_CONFIGS.find((s) => s.slug === slug)
  if (!shopConfig) {
    console.error(`[scraper] Unknown shop slug: "${slug}"`)
    console.error(`Available: ${ALL_SHOP_SLUGS.join(', ')}`)
    process.exit(1)
  }

  if (!shopConfig.enabled) {
    console.warn(`[scraper] Shop "${slug}" is disabled, skipping`)
    return
  }

  const scraper = getScraperForShop(slug)
  if (!scraper) {
    console.error(`[scraper] No scraper registered for shop: "${slug}"`)
    process.exit(1)
  }

  console.log(`\n[scraper] Starting direct scrape for: ${shopConfig.name} (${slug})`)
  console.log('[scraper] ' + '─'.repeat(50))

  const startTime = Date.now()
  await scraper.run()
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`[scraper] Done with ${shopConfig.name} in ${elapsed}s`)
}

async function main(): Promise<void> {
  const args = parseArgs()

  if (Object.keys(args).length === 0) {
    printUsage()
    process.exit(0)
  }

  const direct = args['direct'] === true

  // --descriptions flag
  if (args['descriptions']) {
    console.log('[scraper] Enriching wines with descriptions from product pages...')
    await enrichDescriptions()
    process.exit(0)
  }

  // --enrich flag (always runs inline — no queue path needed)
  if (args['enrich']) {
    const wineId = typeof args['wine'] === 'string' ? args['wine'] : null

    if (wineId) {
      console.log(`[scraper] Enriching single wine: ${wineId}`)
      await enrichWine(wineId)
    } else {
      console.log('[scraper] Running Vivino enrichment for all wines...')
      await enrichAll()
    }

    process.exit(0)
  }

  // --all flag
  if (args['all']) {
    const enabledShops = SHOP_CONFIGS.filter((s) => s.enabled)

    if (direct) {
      console.log(`[scraper] Running ${enabledShops.length} shop scrapers directly (inline)`)
      for (const shop of enabledShops) {
        await runShopDirect(shop.slug)
      }
      console.log('\n[scraper] All shops scraped.')
    } else {
      console.log(`[scraper] Enqueuing ${enabledShops.length} shop scrape jobs via pg-boss`)
      for (const shop of enabledShops) {
        await enqueueShop(shop.slug)
      }
      console.log('\n[scraper] All jobs enqueued. Start the worker to process them: pnpm worker')
    }

    process.exit(0)
  }

  // --shop=<slug> flag
  if (typeof args['shop'] === 'string') {
    if (direct) {
      await runShopDirect(args['shop'])
    } else {
      await enqueueShop(args['shop'])
      console.log('[scraper] Start the worker to process the job: pnpm worker')
    }
    process.exit(0)
  }

  console.error('[scraper] No valid arguments provided.')
  printUsage()
  process.exit(1)
}

main().catch((err) => {
  console.error('[scraper] Fatal error:', err)
  process.exit(1)
})
