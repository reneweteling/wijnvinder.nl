"use client";

import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, XCircle, Star } from "lucide-react";

type ShopListing = {
  id: string;
  shopSlug: string;
  shopName: string;
  price: number;
  originalPrice?: number | null;
  url: string;
  available: boolean;
  rating?: number | null;
};

type PriceComparisonProps = {
  listings: ShopListing[];
};

export function PriceComparison({ listings }: PriceComparisonProps) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-text-light text-sm">
        Geen winkelvermelding beschikbaar.
      </div>
    );
  }

  // Sort: available first, then by price ascending
  const sorted = [...listings].sort((a, b) => {
    if (a.available !== b.available) return a.available ? -1 : 1;
    return a.price - b.price;
  });

  const lowestPrice = Math.min(
    ...listings.filter((l) => l.available).map((l) => l.price)
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Prijsvergelijking</h3>
        <p className="text-sm text-text-light mt-0.5">
          Vergelijk prijzen bij {listings.length}{" "}
          {listings.length === 1 ? "winkel" : "winkels"}
        </p>
      </div>

      <div className="divide-y divide-border">
        {sorted.map((listing, index) => {
          const isCheapest = listing.available && listing.price === lowestPrice;
          const onSale =
            listing.originalPrice != null &&
            listing.originalPrice > listing.price;

          return (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className={`flex items-center justify-between gap-4 px-5 py-4 ${
                isCheapest ? "bg-burgundy-light" : ""
              }`}
            >
              {/* Shop info */}
              <div className="flex items-center gap-3 min-w-0">
                {isCheapest && (
                  <Star className="h-4 w-4 text-burgundy shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">
                      {listing.shopName}
                    </span>
                    {isCheapest && (
                      <span className="text-xs bg-burgundy text-white px-1.5 py-0.5 rounded-full shrink-0">
                        Goedkoopst
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="flex items-center gap-1 shrink-0">
                {listing.available ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-error" />
                )}
                <span
                  className={`text-xs ${listing.available ? "text-success" : "text-error"}`}
                >
                  {listing.available ? "Beschikbaar" : "Niet beschikbaar"}
                </span>
              </div>

              {/* Shop rating */}
              {listing.rating != null ? (
                <div
                  className="shrink-0 flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"
                  title="Winkelwaardering"
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {listing.rating.toFixed(1)}
                </div>
              ) : (
                <div className="shrink-0 w-16" />
              )}

              {/* Price */}
              <div className="text-right shrink-0">
                <div className="font-bold text-burgundy">
                  €{listing.price.toFixed(2)}
                </div>
                {onSale && listing.originalPrice != null && (
                  <div className="text-xs text-text-light line-through">
                    €{listing.originalPrice.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Link */}
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 text-xs text-burgundy hover:text-burgundy-dark font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Bekijk
                <ExternalLink className="h-3 w-3" />
              </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
