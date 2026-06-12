import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";
import { WineCard } from "@/components/wines/wine-card";
import type { WineCardWine } from "@/components/wines/wine-card";
import { SITE_URL } from "@/lib/site";

// Rendered at runtime so the production build never needs a database.
// The query result is cached for 30 minutes via unstable_cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aanbiedingen",
  description:
    "Wijnen die nu met korting te krijgen zijn bij Nederlandse wijnwinkels. Bespaar op kwaliteitswijnen.",
  alternates: {
    canonical: `${SITE_URL}/aanbiedingen`,
  },
  openGraph: {
    title: "Aanbiedingen | WijnVinder",
    description:
      "Wijnen die nu met korting te krijgen zijn bij Nederlandse wijnwinkels. Bespaar op kwaliteitswijnen.",
    url: `${SITE_URL}/aanbiedingen`,
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
  },
};

const LIMIT = 48;

// Prisma can't compare two columns in a where clause, so we fetch wines
// with at least one available listing that has an originalPrice, then
// filter in JS for the real discount (originalPrice > price).
const getDiscountedWines = unstable_cache(
  async () =>
    db.canonicalWine.findMany({
      where: {
        listings: {
          some: {
            available: true,
            originalPrice: { not: null },
          },
        },
      },
      include: {
        listings: {
          where: {
            available: true,
            originalPrice: { not: null },
          },
          orderBy: { price: "asc" },
        },
        producer: {
          select: { name: true },
        },
      },
    }),
  ["aanbiedingen-wines"],
  { revalidate: 1800 },
);

export default async function AanbiedingenPage() {
  const rawWines = await getDiscountedWines();

  // Keep only wines where the cheapest eligible listing is actually discounted
  type RawWine = (typeof rawWines)[number];

  const discountedWines = rawWines
    .map((wine: RawWine) => {
      const listingsWithRealDiscount = wine.listings.filter(
        (l) => l.originalPrice != null && l.originalPrice > l.price
      );
      if (listingsWithRealDiscount.length === 0) return null;

      const cheapest = listingsWithRealDiscount[0]!;
      const discountPct =
        ((cheapest.originalPrice! - cheapest.price) / cheapest.originalPrice!) *
        100;

      return { wine, cheapest, discountPct };
    })
    .filter(
      (
        item
      ): item is {
        wine: RawWine;
        cheapest: RawWine["listings"][number];
        discountPct: number;
      } => item !== null
    )
    // Sort by discount percentage descending
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, LIMIT);

  const cards: WineCardWine[] = discountedWines.map(({ wine, cheapest }) => ({
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
    bestPrice: cheapest.price,
    originalPrice: cheapest.originalPrice,
    shopCount: wine.listings.filter((l) => l.available).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-burgundy">
            Aanbiedingen
          </h1>
          <p className="text-text-light mt-2 max-w-xl">
            Wijnen die nu met korting te krijgen zijn bij Nederlandse
            wijnwinkels.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {cards.length === 0 ? (
          <p className="text-text-light">
            Er zijn momenteel geen aanbiedingen beschikbaar.
          </p>
        ) : (
          <>
            <p className="text-sm text-text-light mb-6">
              {cards.length} {cards.length === 1 ? "aanbieding" : "aanbiedingen"}{" "}
              gevonden, gesorteerd op hoogste korting
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cards.map((wine, i) => (
                <WineCard key={wine.id} wine={wine} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
