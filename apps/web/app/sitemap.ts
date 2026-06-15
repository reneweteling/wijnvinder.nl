import { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { SITE_URL as BASE_URL } from "@/lib/site";
import { FOOD_PAIRINGS } from "@/lib/food-pairings";
import { GRAPE_GUIDES, COUNTRY_GUIDES } from "@/lib/wine-guides";
import { COLLECTION_GUIDES } from "@/lib/wine-collections";

// Rendered at runtime so the production build never needs a database.
export const dynamic = "force-dynamic";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
  { url: `${BASE_URL}/wijnen`, changeFrequency: "daily", priority: 0.9 },
  { url: `${BASE_URL}/sommelier`, changeFrequency: "weekly", priority: 0.8 },
  { url: `${BASE_URL}/wijn-bij`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/druiven`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/wijn-uit`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/wijngids`, changeFrequency: "weekly", priority: 0.7 },
  { url: `${BASE_URL}/winkels`, changeFrequency: "weekly", priority: 0.6 },
  { url: `${BASE_URL}/over-ons`, changeFrequency: "monthly", priority: 0.4 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  { url: `${BASE_URL}/privacybeleid`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${BASE_URL}/algemene-voorwaarden`, changeFrequency: "yearly", priority: 0.2 },
];

const GUIDE_PAGES: MetadataRoute.Sitemap = [
  ...FOOD_PAIRINGS.map((p) => ({ url: `${BASE_URL}/wijn-bij/${p.slug}` })),
  ...GRAPE_GUIDES.map((g) => ({ url: `${BASE_URL}/druiven/${g.slug}` })),
  ...COUNTRY_GUIDES.map((c) => ({ url: `${BASE_URL}/wijn-uit/${c.slug}` })),
  ...COLLECTION_GUIDES.map((c) => ({ url: `${BASE_URL}/wijngids/${c.slug}` })),
].map((e) => ({ ...e, changeFrequency: "weekly" as const, priority: 0.7 }));

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Only index wines and producers that actually have an available listing at an
    // active shop — dead pages with no price hurt crawl budget and quality signals.
    const [wines, producers] = await Promise.all([
      db.canonicalWine.findMany({
        where: { listings: { some: { available: true, shop: { enabled: true } } } },
        select: { slug: true, updatedAt: true },
      }),
      db.producer.findMany({
        where: { wines: { some: { listings: { some: { available: true, shop: { enabled: true } } } } } },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const wineEntries: MetadataRoute.Sitemap = wines.map((wine) => ({
      url: `${BASE_URL}/wijn/${wine.slug}`,
      lastModified: wine.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const producerEntries: MetadataRoute.Sitemap = producers.map((producer) => ({
      url: `${BASE_URL}/producent/${producer.slug}`,
      lastModified: producer.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...STATIC_PAGES, ...GUIDE_PAGES, ...wineEntries, ...producerEntries];
  } catch (error) {
    // A database hiccup should not take down the sitemap entirely.
    console.error("[sitemap]", error);
    return [...STATIC_PAGES, ...GUIDE_PAGES];
  }
}
