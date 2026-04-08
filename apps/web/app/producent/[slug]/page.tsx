import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Star, Globe } from "lucide-react";
import { db } from "@/lib/db/client";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const producer = await db.producer.findUnique({ where: { slug } });

  if (!producer) {
    return { title: "Producent niet gevonden | WijnVinder" };
  }

  return {
    title: `${producer.name} — Alle wijnen | WijnVinder`,
    description: producer.description
      ?? `Bekijk alle wijnen van ${producer.name} bij Nederlandse wijnwinkels en vergelijk prijzen.`,
  };
}

export default async function ProducentPage({ params }: PageProps) {
  const { slug } = await params;

  const producer = await db.producer.findUnique({
    where: { slug },
    include: {
      wines: {
        include: {
          listings: {
            where: { available: true },
            orderBy: { price: "asc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!producer) {
    notFound();
  }

  const countries = [...new Set(producer.wines.map((w) => w.country).filter(Boolean))];
  const regions = [...new Set(producer.wines.map((w) => w.region).filter(Boolean))];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          href="/aanbevelingen"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar aanbevelingen
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10">
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            {producer.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-4 text-text-light">
            {countries.length > 0 && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {[...countries, ...regions].filter(Boolean).join(", ")}
              </span>
            )}
            {producer.website && (
              <a
                href={producer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-burgundy transition-colors"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
          {producer.description && (
            <p className="mt-3 text-text-light max-w-2xl">{producer.description}</p>
          )}
          <p className="mt-2 text-sm text-text-light">
            {producer.wines.length} {producer.wines.length === 1 ? "wijn" : "wijnen"} beschikbaar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {producer.wines.map((wine) => {
            const bestPrice = wine.listings[0]?.price ?? null;

            return (
              <Link
                key={wine.id}
                href={`/wijn/${wine.slug}`}
                className="group block rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-surface flex items-center justify-center overflow-hidden">
                  {wine.imageUrl ? (
                    <Image
                      src={wine.imageUrl}
                      alt={wine.name}
                      fill
                      unoptimized
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-4xl">🍷</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-foreground group-hover:text-burgundy transition-colors">
                    {wine.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-text-light">
                    {wine.vintage && <span>{wine.vintage}</span>}
                    {wine.grape && <span>• {wine.grape}</span>}
                    {wine.region && <span>• {wine.region}</span>}
                  </div>
                  {wine.vivinoScore && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                      <span className="font-medium text-gold">{wine.vivinoScore.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border">
                    {bestPrice ? (
                      <span className="text-lg font-bold text-burgundy">€{bestPrice.toFixed(2)}</span>
                    ) : (
                      <span className="text-sm text-text-light">Prijs onbekend</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
