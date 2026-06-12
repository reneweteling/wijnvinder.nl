"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useSyncExternalStore } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile } from "@/lib/profile-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { Wine, ChevronDown } from "lucide-react";
import { WineGrid } from "@/components/wines/wine-grid";
import { WineFilters } from "@/components/wines/wine-filters";
import { SearchBar } from "@/components/wines/search-bar";
import { SortControls } from "@/components/wines/sort-controls";
import { EmptyState } from "@/components/wines/empty-state";
import { SommelierWidget } from "@/components/sommelier/sommelier-widget";
import type { WineFilters as WineFiltersType } from "@/components/wines/wine-filters";
import type { SortOption } from "@/components/wines/sort-controls";
import { scoreWines } from "@/lib/recommendation-engine";
import type { WineProfileData, WineListItem } from "@/lib/types";
import type { ScoredWine } from "@/lib/recommendation-engine";

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: WineFiltersType = {
  types: [],
  grapes: [],
  countries: [],
  priceMin: 5,
  priceMax: 100,
  minRating: 3,
  aanbiedingen: false,
};

function filtersToParams(filters: WineFiltersType, sort: SortOption, query: string): URLSearchParams {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (filters.types.length > 0) params.set("type", filters.types.join(","));
  if (filters.grapes.length > 0) params.set("grape", filters.grapes.join(","));
  if (filters.countries.length > 0) params.set("country", filters.countries.join(","));
  if (filters.priceMin > 5) params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax < 100) params.set("priceMax", String(filters.priceMax));
  if (filters.minRating > 3) params.set("minRating", String(filters.minRating));
  if (filters.aanbiedingen) params.set("aanbiedingen", "1");
  if (sort !== "match") params.set("sort", sort);
  return params;
}

function paramsToFilters(searchParams: URLSearchParams): { filters: WineFiltersType; sort: SortOption; query: string } {
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
      aanbiedingen: searchParams.get("aanbiedingen") === "1",
    },
    sort,
    query: searchParams.get("q") ?? "",
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
    aanbiedingen: false,
  };
}

async function fetchWines(
  filters: WineFiltersType,
  page: number,
  query: string
): Promise<{ wines: WineListItem[]; total: number }> {
  // Reuse filtersToParams for filter params (sort omitted, sorting is client-side).
  const params = filtersToParams(filters, "match", query);
  // Remove sort param — the API default (rating-desc) is fine; sort happens client-side.
  params.delete("sort");
  params.set("page", String(page));
  params.set("limit", String(PAGE_SIZE));

  const res = await fetch(`/api/wijnen?${params.toString()}`);
  if (!res.ok) throw new Error("Ophalen van wijnen mislukt");
  return res.json() as Promise<{ wines: WineListItem[]; total: number }>;
}

function scoreOrWrap(profile: WineProfileData | null, wines: WineListItem[]): ScoredWine[] {
  if (profile) return scoreWines(profile, wines as unknown as Record<string, unknown>[]);
  return wines.map((w) => ({
    wine: w as unknown as Record<string, unknown>,
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

export default function WijnenPage() {
  return (
    <Suspense>
      <WijnenContent />
    </Suspense>
  );
}

function SommelierBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-burgundy/20 bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-sm hover:bg-burgundy/5 transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-burgundy shrink-0">
            <Wine className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="font-medium text-foreground">
            Weet je niet wat je zoekt?{" "}
            <span className="text-burgundy">Vraag Maurice, onze AI-sommelier</span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-text-light transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="sommelier-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-burgundy/10"
          >
            <div className="px-4 py-4">
              <SommelierWidget variant="compact" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WijnenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Read profile cookie via useSyncExternalStore: server snapshot is null,
  // client snapshot reads the cached cookie (stable reference, no infinite loop).
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);

  // Pure URL-driven: /wijnen = no filters, params = filters
  const initial = paramsToFilters(searchParams);
  const [filters, setFilters] = useState<WineFiltersType>(initial.filters);
  const [sort, setSort] = useState<SortOption>(initial.sort);
  const [query, setQuery] = useState<string>(initial.query);
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
    const params = filtersToParams(filters, sort, query);
    const qs = params.toString();
    router.replace(`/wijnen${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [filters, sort, query, router]);

  useEffect(() => {
    let cancelled = false;
    pageRef.current = 1;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { wines, total: t } = await fetchWines(filters, 1, query);
        if (!cancelled) {
          setTotal(t);
          setScoredWines(scoreOrWrap(profile, wines));
        }
      } catch {
        if (!cancelled) {
          setError("Er is een fout opgetreden bij het laden van de wijnen.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [filters, profile, query]);

  const loadingMoreRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    const nextPage = pageRef.current + 1;
    try {
      const { wines } = await fetchWines(filters, nextPage, query);
      if (wines.length > 0 && mountedRef.current) {
        pageRef.current = nextPage;
        setScoredWines((prev) => {
          const existing = new Set(prev.map((s) => s.wine.id));
          const newWines = scoreOrWrap(profile, wines).filter((s) => !existing.has(s.wine.id));
          return [...prev, ...newWines];
        });
      }
    } catch {
      // loadMore errors are silently swallowed; user can scroll again to retry.
    } finally {
      loadingMoreRef.current = false;
      if (mountedRef.current) setIsLoadingMore(false);
    }
  }, [filters, profile, query]);

  const hasMore = scoredWines.length < total;

  // Sort the scored wines client-side
  const sortedWines = [...scoredWines].sort((a, b) => {
    switch (sort) {
      case "match": {
        const diff = b.score.totalScore - a.score.totalScore;
        if (diff !== 0) return diff;
        // Tiebreak: higher Vivino score first (relevant when no profile)
        const ra = (a.wine.vivinoScore as number | null) ?? 0;
        const rb = (b.wine.vivinoScore as number | null) ?? 0;
        return rb - ra;
      }
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
    setQuery("");
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
              {profile ? "Jouw Aanbevelingen" : "Wijnen"}
            </h1>
            <p className="text-text-light mt-2 max-w-xl">
              {profile
                ? "Wijnen geselecteerd op basis van jouw smaakprofiel, gesorteerd op beste match."
                : "Zoek en filter door alle wijnen, of maak een smaakprofiel aan voor persoonlijke aanbevelingen."}
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
            {/* Sommelier helper */}
            <SommelierBanner />

            {/* Search */}
            <SearchBar value={query} onChange={setQuery} />

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
