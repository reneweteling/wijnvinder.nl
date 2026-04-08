"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WINE_TYPES } from "@/lib/constants";
import { FavoriteButton } from "@/components/wines/favorite-button";

export type WineCardWine = {
  id: string;
  slug?: string | null;
  name: string;
  producer?: string | null;
  grape?: string | null;
  country?: string | null;
  region?: string | null;
  wineType?: string | null;
  vivinoScore?: number | null;
  imageUrl?: string | null;
  bestPrice?: number | null;
  originalPrice?: number | null;
  shopCount?: number;
};

type WineCardProps = {
  wine: WineCardWine;
  matchPercentage?: number;
  index?: number;
};

function WineTypeBadge({ type }: { type: string }) {
  const found = WINE_TYPES.find((t) => t.value === type);
  const label = found?.label ?? type;

  const colorMap: Record<string, string> = {
    red: "bg-burgundy text-white",
    white: "bg-gold-light text-gold",
    rose: "bg-pink-100 text-pink-700",
    sparkling: "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[type] ?? "bg-surface text-foreground"}`}
    >
      {label}
    </span>
  );
}

function VivinoStars({ score }: { score: number }) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-3 w-3 fill-gold text-gold" />
      ))}
      {hasHalf && (
        <span className="relative h-3 w-3 inline-block">
          <Star className="absolute h-3 w-3 text-gold" />
          <Star
            className="absolute h-3 w-3 fill-gold text-gold"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-3 w-3 text-gold" />
      ))}
    </div>
  );
}

export function WineCard({ wine, matchPercentage, index = 0 }: WineCardProps) {
  const onSale =
    wine.originalPrice != null &&
    wine.bestPrice != null &&
    wine.originalPrice > wine.bestPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link href={`/wijn/${wine.slug || wine.id}`} className="block h-full">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
          {/* Image */}
          <div className="relative h-52 bg-surface flex items-center justify-center overflow-hidden">
            {matchPercentage != null && (
              <div className="absolute top-3 left-3 z-10">
                <div className="flex items-center gap-1 bg-burgundy text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                  <TrendingUp className="h-3 w-3" />
                  {matchPercentage}% match
                </div>
              </div>
            )}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              {onSale && (
                <Badge variant="destructive">Aanbieding</Badge>
              )}
              <FavoriteButton wineId={wine.id} />
            </div>
            {wine.imageUrl ? (
              <Image
                src={wine.imageUrl}
                alt={wine.name}
                fill
                unoptimized
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-light">
                <span className="text-5xl">🍷</span>
                <span className="text-xs">Geen afbeelding</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 flex-1 flex flex-col">
            {/* Type badge */}
            {wine.wineType && <WineTypeBadge type={wine.wineType} />}

            {/* Name & Producer */}
            <div>
              <h3 className="font-heading font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-burgundy transition-colors">
                {wine.name}
              </h3>
              {wine.producer && (
                <p className="text-sm text-text-light mt-0.5">{wine.producer}</p>
              )}
            </div>

            {/* Grape & Origin */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-light">
              {wine.grape && (
                <span className="flex items-center gap-1">
                  <span>🍇</span>
                  {wine.grape}
                </span>
              )}
              {(wine.country || wine.region) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[wine.region, wine.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>

            {/* Vivino score */}
            {wine.vivinoScore != null && (
              <div className="flex items-center gap-2">
                <VivinoStars score={wine.vivinoScore} />
                <span className="text-xs font-medium text-gold">
                  {wine.vivinoScore.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price & shop count */}
            <div className="flex items-end justify-between pt-1 border-t border-border mt-auto">
              <div>
                {wine.bestPrice != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-burgundy">
                      €{wine.bestPrice.toFixed(2)}
                    </span>
                    {onSale && wine.originalPrice != null && (
                      <span className="text-sm text-text-light line-through">
                        €{wine.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-text-light">Prijs onbekend</span>
                )}
              </div>
              {wine.shopCount != null && wine.shopCount > 0 && (
                <div className="flex items-center gap-1 text-xs text-text-light">
                  <ShoppingBag className="h-3 w-3" />
                  {wine.shopCount} {wine.shopCount === 1 ? "winkel" : "winkels"}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
