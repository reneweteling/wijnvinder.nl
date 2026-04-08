import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type = searchParams.get("type");
  const grape = searchParams.get("grape");
  const country = searchParams.get("country");
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const minRatingParam = searchParams.get("minRating");
  const sort = searchParams.get("sort") ?? "rating-desc";
  const pageParam = searchParams.get("page") ?? "1";
  const limitParam = searchParams.get("limit") ?? "24";

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 24));
  const skip = (page - 1) * pageSize;

  const priceMin = priceMinParam != null ? parseFloat(priceMinParam) : undefined;
  const priceMax = priceMaxParam != null ? parseFloat(priceMaxParam) : undefined;
  const minRating = minRatingParam != null ? parseFloat(minRatingParam) : undefined;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};

  if (type) {
    // Support comma-separated types
    const types = type.split(",").filter(Boolean);
    if (types.length === 1) {
      where.wineType = types[0];
    } else if (types.length > 1) {
      where.wineType = { in: types };
    }
  }

  if (grape) {
    const grapes = grape.split(",").filter(Boolean);
    if (grapes.length === 1) {
      where.grape = { contains: grapes[0], mode: "insensitive" };
    } else if (grapes.length > 1) {
      where.OR = grapes.map((g) => ({
        grape: { contains: g, mode: "insensitive" },
      }));
    }
  }

  if (country) {
    const countries = country.split(",").filter(Boolean);
    if (countries.length === 1) {
      where.country = { equals: countries[0], mode: "insensitive" };
    } else if (countries.length > 1) {
      where.country = { in: countries, mode: "insensitive" };
    }
  }

  if (minRating != null && !isNaN(minRating)) {
    where.vivinoScore = { gte: minRating };
  }

  // For price filtering we filter via listings
  const listingsWhere =
    priceMin != null || priceMax != null
      ? {
          some: {
            available: true,
            ...(priceMin != null ? { price: { gte: priceMin } } : {}),
            ...(priceMax != null ? { price: { lte: priceMax } } : {}),
          },
        }
      : undefined;

  if (listingsWhere) {
    where.listings = listingsWhere;
  }

  // Build orderBy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: Record<string, any>[] = [];
  switch (sort) {
    case "price-asc":
      orderBy = [{ listings: { _min: { price: "asc" } } }];
      break;
    case "price-desc":
      orderBy = [{ listings: { _min: { price: "desc" } } }];
      break;
    case "rating-desc":
    default:
      orderBy = [
        { vivinoScore: { sort: "desc", nulls: "last" } },
        { name: "asc" },
      ];
      break;
  }

  try {
    const [wines, total] = await Promise.all([
      db.canonicalWine.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          listings: {
            where: { available: true },
            orderBy: { price: "asc" },
          },
        },
      }),
      db.canonicalWine.count({ where }),
    ]);

    // Enrich each wine with computed fields
    const enriched = wines.map((wine) => {
      const availableListings = wine.listings.filter((l) => l.available);
      const cheapest = availableListings[0];

      return {
        ...wine,
        bestPrice: cheapest?.price ?? null,
        originalPrice: cheapest?.originalPrice ?? null,
        shopCount: availableListings.length,
      };
    });

    return NextResponse.json({
      wines: enriched,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("[GET /api/wijnen]", error);
    return NextResponse.json(
      { error: "Interne serverfout" },
      { status: 500 }
    );
  }
}
