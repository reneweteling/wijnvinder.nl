import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import type { CanonicalWineWhereInput } from "@/lib/db/input";

const ALLOWED_SORTS = new Set(["rating-desc", "price-asc", "price-desc"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q")?.trim();
  const type = searchParams.get("type");
  const grape = searchParams.get("grape");
  const country = searchParams.get("country");
  const priceMinParam = searchParams.get("priceMin");
  const priceMaxParam = searchParams.get("priceMax");
  const minRatingParam = searchParams.get("minRating");
  const sortParam = searchParams.get("sort") ?? "rating-desc";
  const sort = ALLOWED_SORTS.has(sortParam) ? sortParam : "rating-desc";
  const pageParam = searchParams.get("page") ?? "1";
  const limitParam = searchParams.get("limit") ?? "24";

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limitParam, 10) || 24));
  const skip = (page - 1) * pageSize;

  const priceMinRaw = priceMinParam != null ? parseFloat(priceMinParam) : NaN;
  const priceMaxRaw = priceMaxParam != null ? parseFloat(priceMaxParam) : NaN;
  const minRatingRaw = minRatingParam != null ? parseFloat(minRatingParam) : NaN;

  const priceMin = !isNaN(priceMinRaw) ? priceMinRaw : undefined;
  const priceMax = !isNaN(priceMaxRaw) ? priceMaxRaw : undefined;
  const minRating = !isNaN(minRatingRaw) ? minRatingRaw : undefined;

  // Build where clause as a single AND array so conditions never overwrite each other.
  const andConditions: CanonicalWineWhereInput[] = [];

  if (q) {
    // Each search term must match at least one field.
    const terms = q.split(/\s+/).filter(Boolean).slice(0, 6);
    for (const term of terms) {
      andConditions.push({
        OR: [
          { name: { contains: term, mode: "insensitive" } },
          { searchName: { contains: term, mode: "insensitive" } },
          { grape: { contains: term, mode: "insensitive" } },
          { region: { contains: term, mode: "insensitive" } },
          { country: { contains: term, mode: "insensitive" } },
          { producer: { name: { contains: term, mode: "insensitive" } } },
        ],
      });
    }
  }

  if (type) {
    const types = type.split(",").filter(Boolean);
    if (types.length === 1) {
      andConditions.push({ wineType: types[0] });
    } else if (types.length > 1) {
      andConditions.push({ wineType: { in: types } });
    }
  }

  if (grape) {
    const grapes = grape.split(",").filter(Boolean);
    if (grapes.length === 1) {
      andConditions.push({ grape: { contains: grapes[0], mode: "insensitive" } });
    } else if (grapes.length > 1) {
      andConditions.push({
        OR: grapes.map((g) => ({
          grape: { contains: g, mode: "insensitive" },
        })),
      });
    }
  }

  if (country) {
    const countries = country.split(",").filter(Boolean);
    if (countries.length === 1) {
      andConditions.push({ country: { equals: countries[0], mode: "insensitive" } });
    } else if (countries.length > 1) {
      andConditions.push({ country: { in: countries, mode: "insensitive" } });
    }
  }

  if (minRating != null) {
    andConditions.push({ vivinoScore: { gte: minRating } });
  }

  if (priceMin != null || priceMax != null) {
    andConditions.push({
      listings: {
        some: {
          available: true,
          ...(priceMin != null ? { price: { gte: priceMin } } : {}),
          ...(priceMax != null ? { price: { lte: priceMax } } : {}),
        },
      },
    });
  }

  const where: CanonicalWineWhereInput = andConditions.length > 0
    ? { AND: andConditions }
    : {};

  // Build orderBy. Aggregate ordering (_min) is not in the generated types, so typed loosely.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any[] = [];
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
            select: {
              id: true,
              price: true,
              originalPrice: true,
              available: true,
              url: true,
              shop: { select: { slug: true, name: true } },
            },
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
