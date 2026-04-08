import { MetadataRoute } from "next";
import { db } from "@/lib/db/client";

const BASE_URL = "https://wijnvinder.nl";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/` },
  { url: `${BASE_URL}/aanbevelingen` },
  { url: `${BASE_URL}/winkels` },
  { url: `${BASE_URL}/over-ons` },
  { url: `${BASE_URL}/contact` },
  { url: `${BASE_URL}/privacybeleid` },
  { url: `${BASE_URL}/profiel` },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
}
