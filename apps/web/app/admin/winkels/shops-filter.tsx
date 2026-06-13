"use client";

import { useState } from "react";
import Image from "next/image";
import { ShopForm } from "./shop-form";

export type ShopItem = {
  id: string;
  name: string;
  slug: string;
  baseUrl: string;
  logoUrl: string | null;
  enabled: boolean;
  referralEnabled: boolean;
  referralParam: string | null;
  affiliateLinkTemplate: string | null;
  listingCount: number;
};

function ShopCard({ shop }: { shop: ShopItem }) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-5">
      <div className="flex items-start gap-4">
        {/* Logo */}
        {shop.logoUrl ? (
          <div className="flex-shrink-0 w-12 h-12 relative">
            <Image
              src={shop.logoUrl}
              alt={`${shop.name} logo`}
              fill
              className="object-contain rounded"
              sizes="48px"
            />
          </div>
        ) : (
          <div className="flex-shrink-0 w-12 h-12 rounded border border-border bg-surface flex items-center justify-center text-text-light text-xs">
            -
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {shop.name}
            </h2>
            <span className="text-xs font-mono text-text-light bg-surface border border-border rounded px-1.5 py-0.5">
              {shop.slug}
            </span>
            {shop.enabled ? (
              <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                actief
              </span>
            ) : (
              <span className="text-xs font-medium text-text-light bg-surface border border-border rounded-full px-2 py-0.5">
                inactief
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-text-light">
            <a
              href={shop.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-burgundy hover:underline truncate max-w-xs"
            >
              {shop.baseUrl}
            </a>
            <span>{shop.listingCount.toLocaleString("nl-NL")} listings</span>
          </div>

          <ShopForm
            shopId={shop.id}
            enabled={shop.enabled}
            referralEnabled={shop.referralEnabled}
            referralParam={shop.referralParam}
            affiliateLinkTemplate={shop.affiliateLinkTemplate}
          />
        </div>
      </div>
    </div>
  );
}

export function ShopsFilter({ shops }: { shops: ShopItem[] }) {
  const [query, setQuery] = useState("");

  const trimmed = query.trim().toLowerCase();
  const visible = trimmed
    ? shops.filter(
        (s) =>
          s.name.toLowerCase().includes(trimmed) ||
          s.slug.toLowerCase().includes(trimmed)
      )
    : shops;

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek winkel"
          className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm w-full max-w-sm placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-text-light text-sm">Geen winkels gevonden.</p>
      ) : (
        <div className="space-y-4">
          {visible.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
