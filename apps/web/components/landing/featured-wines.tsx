import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db/client";
import { WineCard } from "@/components/wines/wine-card";

export async function FeaturedWines({ wineCount }: { wineCount: number }) {
  const wines = await db.canonicalWine.findMany({
    where: {
      vivinoScore: { gte: 4, lte: 4.9 },
      imageUrl: { not: null },
      listings: { some: { available: true } },
      // Keep sample/surprise packages out of the showcase
      NOT: { name: { contains: "pakket", mode: "insensitive" } },
    },
    orderBy: [{ vivinoScore: "desc" }, { name: "asc" }],
    take: 8,
    include: {
      producer: { select: { name: true } },
      listings: {
        where: { available: true },
        orderBy: { price: "asc" },
        take: 1,
      },
    },
  });

  if (wines.length === 0) return null;

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
              Hoog beoordeeld
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-burgundy">
              Populaire wijnen
            </h2>
          </div>
          <Link
            href="/aanbevelingen"
            className="flex items-center gap-2 text-burgundy font-medium hover:text-burgundy/80 transition-colors"
          >
            Bekijk alle {wineCount.toLocaleString("nl-NL")} wijnen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wines.map((wine) => (
            <WineCard
              key={wine.id}
              wine={{
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
                bestPrice: wine.listings[0]?.price ?? null,
                originalPrice: wine.listings[0]?.originalPrice ?? null,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
