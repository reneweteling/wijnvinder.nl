import { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { SITE_URL as BASE_URL } from "@/lib/site";

// Rendered at runtime so the production build never needs a database.
export const dynamic = "force-dynamic";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/` },
  { url: `${BASE_URL}/aanbevelingen` },
  { url: `${BASE_URL}/aanbiedingen` },
  { url: `${BASE_URL}/winkels` },
  { url: `${BASE_URL}/over-ons` },
  { url: `${BASE_URL}/contact` },
  { url: `${BASE_URL}/privacybeleid` },
  { url: `${BASE_URL}/algemene-voorwaarden` },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [wines, producers] = await Promise.all([
      db.canonicalWine.findMany({ select: { slug: true, updatedAt: true } }),
      db.producer.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    const wineEntries: MetadataRoute.Sitemap = wines.map((wine) => ({
      url: `${BASE_URL}/wijn/${wine.slug}`,
      lastModified: wine.updatedAt,
    }));

    const producerEntries: MetadataRoute.Sitemap = producers.map((producer) => ({
      url: `${BASE_URL}/producent/${producer.slug}`,
      lastModified: producer.updatedAt,
    }));

    return [...STATIC_PAGES, ...wineEntries, ...producerEntries];
  } catch (error) {
    // A database hiccup should not take down the sitemap entirely.
    console.error("[sitemap]", error);
    return STATIC_PAGES;
  }
}
