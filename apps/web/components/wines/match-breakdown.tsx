"use client";

import { useMemo } from "react";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { getProfileSnapshot, getServerProfileSnapshot, subscribeProfile } from "@/lib/profile-cookie";
import { TrendingUp, Grape, MapPin, Wine, Sparkles, Tag, Star, UserCircle } from "lucide-react";
import { SCORING_WEIGHTS } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { scoreWine } from "@/lib/scoring";

type MatchBreakdownProps = {
  wine: {
    id: string;
    grape?: string | null;
    grapes?: string[];
    country?: string | null;
    wineType?: string | null;
    vivinoScore?: number | null;
    bestPrice?: number | null;
  };
};

const CATEGORIES = [
  { key: "grapeScore" as const, label: "Druif", max: SCORING_WEIGHTS.grape, icon: Grape },
  { key: "regionScore" as const, label: "Regio", max: SCORING_WEIGHTS.region, icon: MapPin },
  { key: "typeScore" as const, label: "Wijnsoort", max: SCORING_WEIGHTS.type, icon: Wine },
  { key: "flavorScore" as const, label: "Smaak", max: SCORING_WEIGHTS.flavor, icon: Sparkles },
  { key: "priceScore" as const, label: "Prijs", max: SCORING_WEIGHTS.price, icon: Tag },
  { key: "ratingScore" as const, label: "Beoordeling", max: SCORING_WEIGHTS.rating, icon: Star },
];

export function MatchBreakdown({ wine }: MatchBreakdownProps) {
  const profile = useSyncExternalStore(subscribeProfile, getProfileSnapshot, getServerProfileSnapshot);
  const score = useMemo(
    () => (profile ? scoreWine(profile, wine as Record<string, unknown>) : null),
    [profile, wine]
  );

  if (!score) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-burgundy" />
            Jouw Match
          </h3>
        </div>
        <div className="p-5 flex flex-col items-center gap-4 text-center">
          <UserCircle className="h-10 w-10 text-burgundy/40" />
          <p className="text-sm text-text-light">
            Maak een smaakprofiel aan om te zien hoe goed deze wijn bij je past.
          </p>
          <Link href="/profiel" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Maak smaakprofiel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-burgundy" />
            Jouw Match
          </h3>
          <p className="text-sm text-text-light mt-0.5">
            Op basis van jouw smaakprofiel
          </p>
        </div>
        <div className="text-2xl font-bold text-burgundy">
          {score.matchPercentage}%
        </div>
      </div>

      <div className="p-5 space-y-3">
        {CATEGORIES.map(({ key, label, max, icon: Icon }) => {
          const value = score[key];
          const pct = Math.round((value / max) * 100);

          return (
            <div key={key} className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-text-light shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground">{label}</span>
                  <span className="text-xs text-text-light">{value}/{max}</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? '#722F37' : pct >= 50 ? '#C9A96E' : '#d1d5db',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
