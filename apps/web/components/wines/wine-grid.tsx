"use client";

import { useRef, useCallback } from "react";
import { WineCard, type WineCardWine } from "@/components/wines/wine-card";
import type { ScoredWine } from "@/lib/recommendation-engine";

type WineGridProps = {
  wines: ScoredWine[];
  isLoading?: boolean;
  showMatchPercentage?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
};

function WineCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden animate-pulse">
      <div className="h-52 bg-surface" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-surface rounded w-16" />
        <div className="space-y-1.5">
          <div className="h-5 bg-surface rounded w-3/4" />
          <div className="h-4 bg-surface rounded w-1/2" />
        </div>
        <div className="h-4 bg-surface rounded w-2/3" />
        <div className="h-4 bg-surface rounded w-1/3" />
        <div className="pt-1 border-t border-border flex justify-between">
          <div className="h-6 bg-surface rounded w-20" />
          <div className="h-4 bg-surface rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function WineGrid({
  wines,
  isLoading = false,
  showMatchPercentage = false,
  hasMore = false,
  onLoadMore,
  isLoadingMore = false,
}: WineGridProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!node || !onLoadMore) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { rootMargin: "400px" }
      );
      observer.current.observe(node);
    },
    [onLoadMore]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <WineCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (wines.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wines.map((scored) => (
          <WineCard
            key={scored.wine.id as string}
            wine={scored.wine as WineCardWine}
            matchPercentage={showMatchPercentage ? scored.matchPercentage : undefined}
            index={0}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="pt-6">
          {isLoadingMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <WineCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
