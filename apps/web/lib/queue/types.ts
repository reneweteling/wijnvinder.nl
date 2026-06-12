import { z } from "zod";

export enum JobType {
  SCRAPE_SHOP = "scrape-shop",
  ENRICH_LISTING = "enrich-listing",
  ENRICH_VIVINO = "enrich-vivino",
  WEEKLY_DEALS_EMAIL = "weekly-deals-email",
  NIGHTLY_SCRAPE = "nightly-scrape",
}

export const scrapeShopPayloadSchema = z.object({
  shopSlug: z.string(),
});

export const enrichListingPayloadSchema = z.object({
  shopSlug: z.string(),
  shopId: z.string(),
  listingUrl: z.string(),
  canonicalWineId: z.string(),
});

export const enrichVivinoPayloadSchema = z.object({
  canonicalWineId: z.string(),
});

// No payload needed for weekly deals email — it fetches everything itself.
export const weeklyDealsEmailPayloadSchema = z.object({});

// No payload needed for nightly scrape — it resolves enabled shops itself.
export const nightlyScrapePayloadSchema = z.object({});

export const jobSchemas: Record<JobType, z.ZodSchema> = {
  [JobType.SCRAPE_SHOP]: scrapeShopPayloadSchema,
  [JobType.ENRICH_LISTING]: enrichListingPayloadSchema,
  [JobType.ENRICH_VIVINO]: enrichVivinoPayloadSchema,
  [JobType.WEEKLY_DEALS_EMAIL]: weeklyDealsEmailPayloadSchema,
  [JobType.NIGHTLY_SCRAPE]: nightlyScrapePayloadSchema,
};

export type JobPayload<T extends JobType> = T extends JobType.SCRAPE_SHOP
  ? z.infer<typeof scrapeShopPayloadSchema>
  : T extends JobType.ENRICH_LISTING
    ? z.infer<typeof enrichListingPayloadSchema>
    : T extends JobType.ENRICH_VIVINO
      ? z.infer<typeof enrichVivinoPayloadSchema>
      : T extends JobType.WEEKLY_DEALS_EMAIL
        ? z.infer<typeof weeklyDealsEmailPayloadSchema>
        : T extends JobType.NIGHTLY_SCRAPE
          ? z.infer<typeof nightlyScrapePayloadSchema>
          : never;

export interface JobOptions {
  startAfter?: number | Date;
  priority?: number;
  retryLimit?: number;
  retryDelay?: number;
  expireInSeconds?: number;
  singletonKey?: string;
}
