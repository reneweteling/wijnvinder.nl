import { JobType } from "../types";
import type { JobPayload } from "../types";
import { getScraperForShop } from "@/scrapers/shops/index";
import { enrichWine } from "@/scrapers/vivino-enricher";
import { fetchProductPage } from "@/scrapers/fetch-description";
import { db } from "@/lib/db/client";

async function processScrapeShop(job: {
  id: string;
  data: JobPayload<JobType.SCRAPE_SHOP>;
}) {
  console.log(`[scrape-shop] Processing shop: ${job.data.shopSlug}`);
  const scraper = getScraperForShop(job.data.shopSlug);
  if (!scraper) {
    throw new Error(`No scraper registered for shop: ${job.data.shopSlug}`);
  }
  await scraper.run();
}

async function processEnrichListing(job: {
  id: string;
  data: JobPayload<JobType.ENRICH_LISTING>;
}) {
  const { shopId, listingUrl, canonicalWineId, shopSlug } = job.data;
  console.log(`[enrich-listing] ${shopSlug}: ${listingUrl}`);

  const page = await fetchProductPage(listingUrl);

  // Update ShopListing with enriched data
  const listingUpdates: Record<string, unknown> = {};
  if (page.description) listingUpdates.description = page.description;
  if (page.imageUrl) listingUpdates.imageUrl = page.imageUrl;

  if (Object.keys(listingUpdates).length > 0) {
    await db.shopListing.update({
      where: { shopId_url: { shopId, url: listingUrl } },
      data: listingUpdates,
    });
  }

  // Update CanonicalWine only if it still lacks description/image
  const canonical = await db.canonicalWine.findUnique({
    where: { id: canonicalWineId },
    select: { description: true, imageUrl: true },
  });

  const wineUpdates: Record<string, unknown> = {};
  if (page.description && !canonical?.description) {
    wineUpdates.description = page.description;
  }
  if (page.imageUrl && (!canonical?.imageUrl || canonical.imageUrl.includes('unsplash.com'))) {
    wineUpdates.imageUrl = page.imageUrl;
  }

  if (Object.keys(wineUpdates).length > 0) {
    await db.canonicalWine.update({
      where: { id: canonicalWineId },
      data: wineUpdates,
    });
  }

  console.log(
    `[enrich-listing] ${shopSlug}: done (desc: ${!!page.description}, img: ${!!page.imageUrl})`,
  );
}

async function processEnrichVivino(job: {
  id: string;
  data: JobPayload<JobType.ENRICH_VIVINO>;
}) {
  console.log(
    `[enrich-vivino] Enriching wine: ${job.data.canonicalWineId}`,
  );
  await enrichWine(job.data.canonicalWineId);
}

export const processors: {
  [K in JobType]: (job: {
    id: string;
    data: JobPayload<K>;
  }) => Promise<unknown>;
} = {
  [JobType.SCRAPE_SHOP]: processScrapeShop,
  [JobType.ENRICH_LISTING]: processEnrichListing,
  [JobType.ENRICH_VIVINO]: processEnrichVivino,
};
