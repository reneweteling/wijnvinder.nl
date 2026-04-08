import { z } from "zod";

export enum JobType {
  SCRAPE_SHOP = "scrape-shop",
  ENRICH_VIVINO = "enrich-vivino",
}

export const scrapeShopPayloadSchema = z.object({
  shopSlug: z.string(),
});

export const enrichVivinoPayloadSchema = z.object({
  canonicalWineId: z.string(),
});

export const jobSchemas: Record<JobType, z.ZodSchema> = {
  [JobType.SCRAPE_SHOP]: scrapeShopPayloadSchema,
  [JobType.ENRICH_VIVINO]: enrichVivinoPayloadSchema,
};

export type JobPayload<T extends JobType> = T extends JobType.SCRAPE_SHOP
  ? z.infer<typeof scrapeShopPayloadSchema>
  : T extends JobType.ENRICH_VIVINO
    ? z.infer<typeof enrichVivinoPayloadSchema>
    : never;

export interface JobOptions {
  startAfter?: number | Date;
  priority?: number;
  retryLimit?: number;
  retryDelay?: number;
  expireInSeconds?: number;
}
