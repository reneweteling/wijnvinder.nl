import { db } from "@/lib/db/client";
import { pickPromotedListing } from "@/lib/listings";
import type { WineCardWine, WineType } from "@/lib/types";
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
      AND: [
        { listings: { some: { available: true, shop: { enabled: true } } } },
        { NOT: { name: { contains: "pakket", mode: "insensitive" } } },
        where,
      ],
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

export type CollectionFilter = {
  wineTypes?: WineType[];
  priceMax?: number;
  priceMin?: number;
  onSale?: boolean;
  minRating?: number;
};

/**
 * Fetch wines for a selection/price collection page. Filters happen at the
 * listing level (price, discount) and the wine level (type, rating). The card
 * price is the promoted listing; for a priceMax we over-fetch and then keep
 * only wines whose promoted price actually falls within the limit, so the shown
 * price always matches the page. Discount sorting ranks by the largest markdown.
 */
export async function fetchCollectionWines(
  filter: CollectionFilter,
  sort: "rating" | "discount",
  limit = 12,
): Promise<WineCardWine[]> {
  const listingSome: Record<string, unknown> = { available: true, shop: { enabled: true } };
  const priceWhere: Record<string, number> = {};
  if (filter.priceMax != null) priceWhere.lte = filter.priceMax;
  if (filter.priceMin != null) priceWhere.gte = filter.priceMin;
  if (Object.keys(priceWhere).length) listingSome.price = priceWhere;
  if (filter.onSale) listingSome.originalPrice = { not: null };

  const where: CanonicalWineWhereInput = {
    listings: { some: listingSome },
    NOT: { name: { contains: "pakket", mode: "insensitive" } },
    ...(filter.wineTypes?.length ? { wineType: { in: filter.wineTypes } } : {}),
    ...(filter.minRating != null ? { vivinoScore: { gte: filter.minRating } } : {}),
  };

  // Over-fetch when we still need to filter/sort on the promoted listing in JS.
  const needsJsFilter =
    filter.priceMax != null || filter.priceMin != null || sort === "discount";
  const take = needsJsFilter ? limit * 5 : limit;

  const rows = await db.canonicalWine.findMany({
    where,
    include: {
      producer: { select: { name: true } },
      listings: {
        where: { available: true, shop: { enabled: true } },
        include: { shop: { select: { priority: true } } },
      },
    },
    orderBy: [{ vivinoScore: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take,
  });

  let mapped = rows.map((wine) => {
    const promo = pickPromotedListing(wine.listings);
    const price = promo?.price ?? null;
    const originalPrice = promo?.originalPrice ?? null;
    const discount =
      price != null && originalPrice != null && originalPrice > price
        ? (originalPrice - price) / originalPrice
        : 0;
    return {
      card: {
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
        bestPrice: price,
        originalPrice,
        shopCount: wine.listings.filter((l) => l.available).length,
      } satisfies WineCardWine,
      price,
      discount,
    };
  });

  if (filter.priceMax != null) {
    mapped = mapped.filter((m) => m.price != null && m.price <= filter.priceMax!);
  }
  if (filter.priceMin != null) {
    mapped = mapped.filter((m) => m.price != null && m.price >= filter.priceMin!);
  }
  if (filter.onSale) {
    mapped = mapped.filter((m) => m.discount > 0);
  }
  if (sort === "discount") {
    mapped.sort((a, b) => b.discount - a.discount);
  }

  return mapped.slice(0, limit).map((m) => m.card);
}
