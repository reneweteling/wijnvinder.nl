"use client";

import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, XCircle, Star } from "lucide-react";
import { track } from "@/lib/analytics";

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
              className={`flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 ${
                isCheapest ? "bg-burgundy-light" : ""
              }`}
            >
              {/* Left: shop name + badge, with availability/rating as meta below */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {isCheapest && (
                    <Star className="h-4 w-4 text-burgundy shrink-0" />
                  )}
                  <span className="font-medium text-sm text-foreground truncate">
                    {listing.shopName}
                  </span>
                  {isCheapest && (
                    <span className="text-[11px] leading-none bg-burgundy text-white px-1.5 py-1 rounded-full shrink-0">
                      Goedkoopst
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap">
                  <span
                    className={`flex items-center gap-1 text-xs ${
                      listing.available ? "text-success" : "text-error"
                    }`}
                  >
                    {listing.available ? (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {listing.available ? "Beschikbaar" : "Niet beschikbaar"}
                  </span>
                  {listing.rating != null && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium text-amber-700"
                      title="Winkelwaardering"
                    >
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                      {listing.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: price + link */}
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-burgundy">
                    €{listing.price.toFixed(2)}
                  </span>
                  {onSale && listing.originalPrice != null && (
                    <span className="text-xs text-text-light line-through">
                      €{listing.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <a
                  href={`/uit/${listing.id}?bron=prijsvergelijking`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-burgundy hover:text-burgundy-dark font-medium transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    track("shop_clickthrough", {
                      shop_name: listing.shopName,
                      price: listing.price,
                      source: "prijsvergelijking",
                    });
                  }}
                >
                  Bekijk
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
