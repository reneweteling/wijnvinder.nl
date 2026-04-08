import { JobType } from "../types";
import type { JobPayload } from "../types";
import { getScraperForShop } from "@/scrapers/shops/index";
import { enrichWine } from "@/scrapers/vivino-enricher";

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
  [JobType.ENRICH_VIVINO]: processEnrichVivino,
};
