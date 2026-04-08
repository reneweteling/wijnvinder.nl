/**
 * Registry mapping shop slug to scraper class.
 * Import this to look up the right scraper for a given shop.
 */

import type { BaseScraper } from '../base-scraper'
import { WijnvoordeelScraper } from './wijnvoordeel'
import { WijnbeursScraper } from './wijnbeurs'
import { GallScraper } from './gall'

type ScraperConstructor = new () => BaseScraper

export const SCRAPER_REGISTRY: Record<string, ScraperConstructor> = {
  wijnvoordeel: WijnvoordeelScraper,
  wijnbeurs: WijnbeursScraper,
  gall: GallScraper,
}

/**
 * Get a scraper instance for a given shop slug.
 * Returns null if no scraper is registered for the slug.
 */
export function getScraperForShop(slug: string): BaseScraper | null {
  const Ctor = SCRAPER_REGISTRY[slug]
  if (!Ctor) return null
  return new Ctor()
}

export const ALL_SHOP_SLUGS = Object.keys(SCRAPER_REGISTRY)
