"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { WineGrid } from "@/components/wines/wine-grid";
import { WineFilters } from "@/components/wines/wine-filters";
import { SortControls } from "@/components/wines/sort-controls";
import { EmptyState } from "@/components/wines/empty-state";
import type { WineFilters as WineFiltersType } from "@/components/wines/wine-filters";
import type { SortOption } from "@/components/wines/sort-controls";
import { scoreWines } from "@/lib/recommendation-engine";
import type { WineProfileData } from "@/lib/types";
import type { ScoredWine } from "@/lib/recommendation-engine";

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: WineFiltersType = {
  types: [],
  grapes: [],
  countries: [],
  priceMin: 5,
  priceMax: 100,
  minRating: 3,
};

function filtersToParams(filters: WineFiltersType, sort: SortOption): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.grapes.length > 0) params.set("grape", filters.grapes.join(","));
  if (filters.countries.length > 0) params.set("country", filters.countries.join(","));
  if (filters.priceMin > 5) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax < 100) params.set("priceMax", String(filters.priceMax));
  if (filters.minRating > 3) params.set("minRating", String(filters.minRating));
  if (sort !== "match") params.set("sort", sort);
  return params;
}

function paramsToFilters(searchParams: URLSearchParams): { filters: WineFiltersType; sort: SortOption } {
  const type = searchParams.get("type");
  const grape = searchParams.get("grape");
  const country = searchParams.get("country");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const minRating = searchParams.get("minRating");
  const sort = (searchParams.get("sort") as SortOption) || "match";

  return {
    filters: {
      types: type ? (type.split(",").filter(Boolean) as WineFiltersType["types"]) : [],
      grapes: grape ? grape.split(",").filter(Boolean) : [],
      countries: country ? country.split(",").filter(Boolean) : [],
      priceMin: priceMin ? Number(priceMin) : 5,
      priceMax: priceMax ? Number(priceMax) : 100,
      minRating: minRating ? Number(minRating) : 3,
    },
    sort,
  };
}

function profileToFilters(profile: WineProfileData): WineFiltersType {
  return {
    types: profile.wineTypes.length > 0 ? profile.wineTypes : [],
    grapes: profile.grapes.length > 0 ? profile.grapes : [],
    countries: profile.countries.length > 0 ? profile.countries : [],
    priceMin: profile.priceMin ?? 5,
    priceMax: profile.priceMax ?? 100,
    minRating: 3,
  };
}

function readProfileCookie(): WineProfileData | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("wine-profile="));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    return JSON.parse(raw) as WineProfileData;
  } catch {
    return null;
  }
}

async function fetchWines(
  filters: WineFiltersType,
  page: number
): Promise<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wines: any[];
  total: number;
}> {
  const params = new URLSearchParams();

  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.grapes.length > 0) params.set("grape", filters.grapes.join(","));
  if (filters.countries.length > 0)
    params.set("country", filters.countries.join(","));
  if (filters.priceMin > 5) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax < 100)
    params.set("priceMax", String(filters.priceMax));
  if (filters.minRating > 3)
    params.set("minRating", String(filters.minRating));
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  const res = await fetch(`/api/wijnen?${params.toString()}`);
  if (!res.ok) throw new Error("Ophalen van wijnen mislukt");
  return res.json();
}

function scoreOrWrap(
  profile: WineProfileData | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wines: any[]
): ScoredWine[] {
  if (profile) return scoreWines(profile, wines);
  return wines.map((w) => ({
    wine: w,
    score: {
      wineId: w.id,
      totalScore: w.vivinoScore ? w.vivinoScore * 20 : 50,
      grapeScore: 0,
      regionScore: 0,
      typeScore: 0,
      flavorScore: 0,
      priceScore: 0,
      ratingScore: 0,
    },
    matchPercentage: 0,
  }));
}

export default function AanbevelingenPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profile] = useState<WineProfileData | null>(() => readProfileCookie());

  // Pure URL-driven: /aanbevelingen = no filters, params = filters
  const initial = paramsToFilters(searchParams);
  const [filters, setFilters] = useState<WineFiltersType>(initial.filters);
  const [sort, setSort] = useState<SortOption>(initial.sort);
  const [scoredWines, setScoredWines] = useState<ScoredWine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const pageRef = useRef(1);
  const isInitialMount = useRef(true);

  // Sync filters/sort to URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const params = filtersToParams(filters, sort);
    const qs = params.toString();
    router.replace(`/aanbevelingen${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters, sort, router]);

  const loadWines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    pageRef.current = 1;
    try {
      const { wines, total: t } = await fetchWines(filters, 1);
      setTotal(t);
      setScoredWines(scoreOrWrap(profile, wines));
    } catch (err) {
      console.error(err);
      setError("Er is een fout opgetreden bij het laden van de wijnen.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, profile]);

  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const { wines } = await fetchWines(filters, nextPage);
      if (wines.length > 0) {
        pageRef.current = nextPage;
        setScoredWines((prev) => [...prev, ...scoreOrWrap(profile, wines)]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [filters, profile]);

  useEffect(() => {
    loadWines();
  }, [loadWines]);

  const hasMore = scoredWines.length < total;

  // Sort the scored wines client-side
  const sortedWines = [...scoredWines].sort((a, b) => {
    switch (sort) {
      case "match":
        return b.score.totalScore - a.score.totalScore;
      case "price-asc": {
        const pa = (a.wine.bestPrice as number | null) ?? Infinity;
        const pb = (b.wine.bestPrice as number | null) ?? Infinity;
        return pa - pb;
      }
      case "price-desc": {
        const pa = (a.wine.bestPrice as number | null) ?? -Infinity;
        const pb = (b.wine.bestPrice as number | null) ?? -Infinity;
        return pb - pa;
      }
      case "rating-desc": {
        const ra = (a.wine.vivinoScore as number | null) ?? 0;
        const rb = (b.wine.vivinoScore as number | null) ?? 0;
        return rb - ra;
      }
      default:
        return 0;
    }
  });

  const handleApplyProfile = () => {
    if (!profile) return;
    setFilters(profileToFilters(profile));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-burgundy">
              Jouw Aanbevelingen
            </h1>
            <p className="text-text-light mt-2 max-w-xl">
              {profile
                ? "Wijnen geselecteerd op basis van jouw smaakprofiel, gesorteerd op beste match."
                : "Maak een smaakprofiel aan voor gepersonaliseerde aanbevelingen."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="flex gap-8">
          {/* Filters sidebar (desktop) + mobile trigger */}
          <WineFilters
            filters={filters}
            onChange={setFilters}
            hasProfile={!!profile}
            onApplyProfile={handleApplyProfile}
          />

          {/* Wine listing */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Sort controls */}
            <SortControls
              value={sort}
              onChange={setSort}
              total={isLoading ? undefined : total}
            />

            {/* Error state */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Grid or empty state */}
            {!isLoading && !error && sortedWines.length === 0 ? (
              <EmptyState onClearFilters={handleClearFilters} />
            ) : (
              <WineGrid
                wines={sortedWines}
                isLoading={isLoading}
                showMatchPercentage={profile != null && sort === "match"}
                hasMore={hasMore}
                onLoadMore={loadMore}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
