import { db } from "@/lib/db/client";
import { pickPromotedListing } from "@/lib/listings";
import type { WineCardWine } from "@/lib/types";
import type { CanonicalWineWhereInput } from "@/lib/db/input";

/**
 * Fetch the best-rated wines matching a where clause for a guide page, mapped to
 * the WineCard shape with the promoted listing's price. Always limited to wines
 * that have an available listing at an active shop.
 */
export async function fetchGuideWines(
  where: CanonicalWineWhereInput,
  limit = 12,
): Promise<WineCardWine[]> {
  const rows = await db.canonicalWine.findMany({
    where: {
      listings: { some: { available: true, shop: { enabled: true } } },
      NOT: { name: { contains: "pakket", mode: "insensitive" } },
      ...where,
    },
    include: {
      producer: { select: { name: true } },
      listings: {
        where: { available: true, shop: { enabled: true } },
        include: { shop: { select: { priority: true } } },
      },
    },
    orderBy: [{ vivinoScore: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: limit,
  });

  return rows.map((wine) => {
    const promo = pickPromotedListing(wine.listings);
    return {
      id: wine.id,
      slug: wine.slug,
      name: wine.name,
      producer: wine.producer?.name ?? null,
      grape: wine.grape,
      country: wine.country,
      region: wine.region,
      wineType: wine.wineType,
      vivinoScore: wine.vivinoScore,
      imageUrl: wine.imageUrl,
      bestPrice: promo?.price ?? null,
      originalPrice: promo?.originalPrice ?? null,
      shopCount: wine.listings.filter((l) => l.available).length,
    };
  });
}
