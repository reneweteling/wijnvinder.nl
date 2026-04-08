"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Grape, MapPin, Wine, Sparkles, Tag, Star } from "lucide-react";
import { SCORING_WEIGHTS } from "@/lib/constants";
import type { WineProfileData, RecommendationScore } from "@/lib/types";

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

// Import scoring logic inline to avoid circular deps — mirrors recommendation-engine.ts
function scoreWineForBreakdown(profile: WineProfileData, wine: MatchBreakdownProps["wine"]): RecommendationScore & { matchPercentage: number } {
  // Lazy import to avoid bundling the full engine
  const GRAPE_FLAVOR_MAP: Record<string, string[]> = {
    'Cabernet Sauvignon': ['tannic', 'oaky', 'dry', 'earthy'],
    'Merlot': ['fruity', 'oaky', 'dry'],
    'Pinot Noir': ['fruity', 'earthy', 'spicy'],
    'Syrah/Shiraz': ['spicy', 'tannic', 'fruity', 'earthy'],
    'Tempranillo': ['tannic', 'dry', 'earthy', 'spicy'],
    'Sangiovese': ['tannic', 'dry', 'earthy', 'spicy'],
    'Nebbiolo': ['tannic', 'dry', 'earthy', 'spicy'],
    'Malbec': ['fruity', 'tannic', 'oaky'],
    'Grenache/Garnacha': ['fruity', 'spicy', 'dry'],
    'Chardonnay': ['oaky', 'fruity', 'mineral'],
    'Sauvignon Blanc': ['mineral', 'floral', 'dry'],
    'Riesling': ['floral', 'mineral', 'fruity'],
    'Pinot Grigio/Pinot Gris': ['mineral', 'dry', 'floral'],
    'Gewürztraminer': ['floral', 'spicy', 'fruity'],
    'Viognier': ['floral', 'fruity', 'oaky'],
    'Chenin Blanc': ['fruity', 'mineral', 'floral'],
  };

  const allWineGrapes = [...(wine.grape ? [wine.grape] : []), ...(wine.grapes ?? [])];

  // Grape score
  let grapeScore = 0;
  if (profile.grapes.length > 0) {
    const exactMatch = allWineGrapes.some((g) =>
      profile.grapes.some((pg) => pg.toLowerCase() === g.toLowerCase())
    );
    if (exactMatch) {
      grapeScore = SCORING_WEIGHTS.grape;
    } else {
      const wineF = new Set(allWineGrapes.flatMap((g) => GRAPE_FLAVOR_MAP[g] ?? []));
      const profF = new Set(profile.grapes.flatMap((g) => GRAPE_FLAVOR_MAP[g] ?? []));
      const overlap = [...wineF].filter((f) => profF.has(f)).length;
      const union = new Set([...wineF, ...profF]).size;
      grapeScore = union > 0 ? Math.round((overlap / union) * (SCORING_WEIGHTS.grape / 2)) : 0;
    }
  } else {
    grapeScore = SCORING_WEIGHTS.grape / 2;
  }

  // Region score
  let regionScore = 0;
  const wineCountry = wine.country?.toLowerCase();
  if (profile.countries.length > 0 && wineCountry) {
    regionScore = profile.countries.some((c) => c.toLowerCase() === wineCountry)
      ? SCORING_WEIGHTS.region : 0;
  } else {
    regionScore = SCORING_WEIGHTS.region / 2;
  }

  // Type score
  let typeScore = 0;
  const wineType = wine.wineType?.toLowerCase();
  if (profile.wineTypes.length > 0 && wineType) {
    typeScore = profile.wineTypes.some((t) => t.toLowerCase() === wineType)
      ? SCORING_WEIGHTS.type : 0;
  } else {
    typeScore = Math.round(SCORING_WEIGHTS.type / 2);
  }

  // Flavor score
  let flavorScore = 0;
  if (profile.flavors.length > 0) {
    const wineF = new Set(allWineGrapes.flatMap((g) => GRAPE_FLAVOR_MAP[g] ?? []));
    const matches = profile.flavors.filter((f) => wineF.has(f)).length;
    flavorScore = Math.round((matches / profile.flavors.length) * SCORING_WEIGHTS.flavor);
  } else {
    flavorScore = Math.round(SCORING_WEIGHTS.flavor / 2);
  }

  // Price score
  let priceScore = 0;
  if (wine.bestPrice != null) {
    if (wine.bestPrice >= profile.priceMin && wine.bestPrice <= profile.priceMax) {
      priceScore = SCORING_WEIGHTS.price;
    } else if (wine.bestPrice < profile.priceMin) {
      priceScore = Math.max(0, SCORING_WEIGHTS.price - Math.round((profile.priceMin - wine.bestPrice) / 2));
    } else {
      priceScore = Math.max(0, SCORING_WEIGHTS.price - Math.round((wine.bestPrice - profile.priceMax) / 5));
    }
  } else {
    priceScore = SCORING_WEIGHTS.price / 2;
  }

  // Rating score
  let ratingScore = 0;
  if (wine.vivinoScore != null) {
    if (wine.vivinoScore >= 4.0) ratingScore = SCORING_WEIGHTS.rating;
    else if (wine.vivinoScore >= 3.5) ratingScore = Math.round(SCORING_WEIGHTS.rating * 0.7);
    else if (wine.vivinoScore >= 3.0) ratingScore = Math.round(SCORING_WEIGHTS.rating * 0.4);
    else ratingScore = 1;
  } else {
    ratingScore = SCORING_WEIGHTS.rating / 2;
  }

  const totalScore = grapeScore + regionScore + typeScore + flavorScore + priceScore + ratingScore;

  return {
    wineId: wine.id,
    totalScore,
    grapeScore,
    regionScore,
    typeScore,
    flavorScore,
    priceScore,
    ratingScore,
    matchPercentage: Math.round((totalScore / 100) * 100),
  };
}

function readProfileCookie(): WineProfileData | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("wine-profile="));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

const CATEGORIES = [
  { key: "grapeScore" as const, label: "Druif", max: SCORING_WEIGHTS.grape, icon: Grape },
  { key: "regionScore" as const, label: "Regio", max: SCORING_WEIGHTS.region, icon: MapPin },
  { key: "typeScore" as const, label: "Wijnsoort", max: SCORING_WEIGHTS.type, icon: Wine },
  { key: "flavorScore" as const, label: "Smaak", max: SCORING_WEIGHTS.flavor, icon: Sparkles },
  { key: "priceScore" as const, label: "Prijs", max: SCORING_WEIGHTS.price, icon: Tag },
  { key: "ratingScore" as const, label: "Beoordeling", max: SCORING_WEIGHTS.rating, icon: Star },
];

export function MatchBreakdown({ wine }: MatchBreakdownProps) {
  const [score, setScore] = useState<(RecommendationScore & { matchPercentage: number }) | null>(null);

  useEffect(() => {
    const profile = readProfileCookie();
    if (profile) {
      setScore(scoreWineForBreakdown(profile, wine));
    }
  }, [wine]);

  if (!score) return null;

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
