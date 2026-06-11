"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ShoppingBag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WINE_TYPES } from "@/lib/constants";
import { FavoriteButton } from "@/components/wines/favorite-button";
import { RatingStars } from "@/components/wines/rating-stars";
import type { WineCardWine } from "@/lib/types";

// Re-export so existing importers of this type don't break.
export type { WineCardWine } from "@/lib/types";

type WineCardProps = {
  wine: WineCardWine;
  matchPercentage?: number;
  index?: number;
  priority?: boolean;
};

function WineTypeBadge({ type }: { type: string }) {
  const found = WINE_TYPES.find((t) => t.value === type);
  const label = found?.label ?? type;

  const colorMap: Record<string, string> = {
    red: "bg-burgundy text-white",
    white: "bg-gold-light text-amber-700",
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

export function WineCard({ wine, matchPercentage, index: _index = 0, priority: _priority = false }: WineCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
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
            {wine.imageUrl && !imageFailed ? (
              <Image
                src={wine.imageUrl}
                alt={wine.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                onError={() => setImageFailed(true)}
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
              <h2 className="font-heading font-semibold text-foreground text-base leading-tight line-clamp-2 group-hover:text-burgundy transition-colors">
                {wine.name}
              </h2>
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

            {/* Rating */}
            {wine.vivinoScore != null && (
              <div className="flex items-center gap-2">
                <RatingStars score={wine.vivinoScore} size="sm" />
                <span className="text-xs font-medium text-amber-700">
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
