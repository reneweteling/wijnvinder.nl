/**
 * HTTP + Cheerio base class for HTML scraping.
 *
 * Features:
 * - fetch() with 3x retry and exponential backoff
 * - 2s rate-limiting delay between requests
 * - User-Agent rotation
 * - Returns a Cheerio root ($) ready for selector queries
 */

import * as cheerio from 'cheerio'
import type { CheerioAPI } from 'cheerio'
import { BaseScraper } from './base-scraper'
import type { ShopConfig } from '@/lib/types'

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

const RATE_LIMIT_MS = 2000
const MAX_RETRIES = 3
const BASE_BACKOFF_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

export abstract class CheerioScraper extends BaseScraper {
  private lastRequestAt = 0

  constructor(config: ShopConfig) {
    super(config)
  }

  /**
   * Fetch a URL with retry and rate limiting.
   * Returns a Cheerio root for HTML parsing.
   */
  protected async fetchPage(url: string): Promise<CheerioAPI> {
    // Rate limiting: enforce minimum delay between requests
    const now = Date.now()
    const elapsed = now - this.lastRequestAt
    if (elapsed < RATE_LIMIT_MS) {
      await sleep(RATE_LIMIT_MS - elapsed)
    }

    let lastError: Error | undefined

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': randomUserAgent(),
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
          },
          redirect: 'follow',
        })

        this.lastRequestAt = Date.now()

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status} ${response.statusText} for ${url}`,
          )
        }

        const html = await response.text()
        return cheerio.load(html)
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt - 1)
        console.warn(
          `[${this.config.slug}] Attempt ${attempt}/${MAX_RETRIES} failed for ${url}: ${lastError.message}. Retrying in ${backoff}ms...`,
        )
        await sleep(backoff)
      }
    }

    throw lastError ?? new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts`)
  }
}
