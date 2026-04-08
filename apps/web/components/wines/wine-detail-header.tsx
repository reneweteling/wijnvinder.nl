"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Star, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WINE_TYPES } from "@/lib/constants";
import { FavoriteButton } from "@/components/wines/favorite-button";

type WineDetailHeaderProps = {
  wine: {
    id: string;
    name: string;
    producer?: string | null;
    grape?: string | null;
    grapes?: string[];
    country?: string | null;
    region?: string | null;
    wineType?: string | null;
    vintage?: number | null;
    vivinoScore?: number | null;
    vivinoScoreCount?: number | null;
    vivinoUrl?: string | null;
    imageUrl?: string | null;
    description?: string | null;
  };
  bestPrice?: number | null;
  originalPrice?: number | null;
  bestShopName?: string | null;
  bestShopUrl?: string | null;
  producerSlug?: string;
};

function RatingStars({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-5 w-5 fill-gold text-gold" />
      ))}
      {hasHalf && (
        <span className="relative h-5 w-5 inline-block">
          <Star className="absolute h-5 w-5 text-gold" />
          <Star
            className="absolute h-5 w-5 fill-gold text-gold"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-5 w-5 text-gold" />
      ))}
    </div>
  );
}

export function WineDetailHeader({
  wine,
  bestPrice,
  originalPrice,
  bestShopName,
  bestShopUrl,
  producerSlug,
}: WineDetailHeaderProps) {
  const wineTypeLabel =
    WINE_TYPES.find((t) => t.value === wine.wineType)?.label ?? wine.wineType;

  const onSale =
    originalPrice != null && bestPrice != null && originalPrice > bestPrice;

  const allGrapes = [
    ...(wine.grape ? [wine.grape] : []),
    ...(wine.grapes ?? []),
  ].filter((g, i, arr) => arr.indexOf(g) === i);

  return (
    <section className="bg-card border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          {/* Wine image */}
          <motion.div
            className="shrink-0 w-full md:w-64 h-72 md:h-96 relative bg-surface rounded-2xl overflow-hidden flex items-center justify-center"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {wine.imageUrl ? (
              <Image
                src={wine.imageUrl}
                alt={wine.name}
                fill
                unoptimized
                className="object-contain p-6"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-light">
                <span className="text-6xl">🍷</span>
                <span className="text-sm">Geen afbeelding</span>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            className="flex-1 space-y-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {wineTypeLabel && (
                <Badge variant="default">{wineTypeLabel}</Badge>
              )}
              {wine.vintage && (
                <Badge variant="secondary">{wine.vintage}</Badge>
              )}
              {onSale && (
                <Badge variant="destructive">Aanbieding</Badge>
              )}
            </div>

            {/* Name */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {wine.name}
              </h1>
              {wine.producer && (
                <p className="text-lg text-text-light mt-1">
                  {producerSlug ? (
                    <a href={`/producent/${producerSlug}`} className="hover:text-burgundy hover:underline transition-colors">
                      {wine.producer}
                    </a>
                  ) : (
                    wine.producer
                  )}
                </p>
              )}
            </div>

            {/* Meta info */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {allGrapes.length > 0 && (
                <div>
                  <dt className="text-text-light">Druivensoort</dt>
                  <dd className="font-medium text-foreground">
                    {allGrapes.join(", ")}
                  </dd>
                </div>
              )}
              {(wine.country || wine.region) && (
                <div>
                  <dt className="text-text-light flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Herkomst
                  </dt>
                  <dd className="font-medium text-foreground">
                    {[wine.region, wine.country].filter(Boolean).join(", ")}
                  </dd>
                </div>
              )}
            </dl>

            {/* Rating */}
            {wine.vivinoScore != null && (
              <div className="flex items-center gap-3">
                <RatingStars score={wine.vivinoScore} />
                <span className="font-bold text-gold text-lg">
                  {wine.vivinoScore.toFixed(1)}
                </span>
                {wine.vivinoScoreCount != null && (
                  <span className="text-sm text-text-light">
                    ({wine.vivinoScoreCount.toLocaleString("nl-NL")} beoordelingen)
                  </span>
                )}
                {wine.vivinoUrl && (
                  <a
                    href={wine.vivinoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-burgundy hover:text-burgundy-dark flex items-center gap-0.5 transition-colors"
                  >
                    Bekijk beoordeling
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            {/* Description */}
            {wine.description && (
              <p className="text-sm text-text-light leading-relaxed max-w-prose">
                {wine.description}
              </p>
            )}

            {/* Price CTA */}
            {bestPrice != null && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div>
                  <p className="text-xs text-text-light mb-0.5">
                    Beste prijs
                    {bestShopName ? ` bij ${bestShopName}` : ""}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-burgundy">
                      €{bestPrice.toFixed(2)}
                    </span>
                    {onSale && originalPrice != null && (
                      <span className="text-base text-text-light line-through">
                        €{originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {bestShopUrl && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() =>
                      window.open(bestShopUrl, "_blank", "noopener,noreferrer")
                    }
                    className="flex items-center gap-2"
                  >
                    Bekijk aanbieding
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <FavoriteButton wineId={wine.id} size="md" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
