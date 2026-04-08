"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Wine, Star, AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VivinoWineRating, WineProfileData } from "@/lib/types";

interface VivinoImportProps {
  onImport: (data: Partial<WineProfileData>) => void;
  onClose: () => void;
}

function derivePrefFromRatings(
  ratings: VivinoWineRating[],
): Partial<WineProfileData> {
  // Only use wines rated >= 3.5
  const goodRatings = ratings.filter((r) => r.rating >= 3.5);

  // Extract grapes
  const grapes = [
    ...new Set(
      goodRatings.map((r) => r.grape).filter((g): g is string => Boolean(g)),
    ),
  ];

  // Extract countries
  const countries = [
    ...new Set(
      goodRatings
        .map((r) => r.country)
        .filter((c): c is string => Boolean(c)),
    ),
  ];

  // Extract wine types
  const typeMap: Record<string, string> = {
    red: "red",
    rood: "red",
    white: "white",
    wit: "white",
    rose: "rose",
    rosé: "rose",
    sparkling: "sparkling",
    mousserende: "sparkling",
    champagne: "sparkling",
    prosecco: "sparkling",
    cava: "sparkling",
  };

  const wineTypeSet = new Set<string>();
  for (const r of goodRatings) {
    if (r.wineType) {
      const mapped = typeMap[r.wineType.toLowerCase()];
      if (mapped) wineTypeSet.add(mapped);
    }
  }

  return {
    grapes: grapes.slice(0, 10),
    countries: countries.slice(0, 8),
    wineTypes: [...wineTypeSet] as WineProfileData["wineTypes"],
  };
}

export function VivinoImport({ onImport, onClose }: VivinoImportProps) {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratings, setRatings] = useState<VivinoWineRating[] | null>(null);
  const [importedUsername, setImportedUsername] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  const handleImport = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    setError(null);
    setRatings(null);
    setIsMockData(false);

    try {
      const res = await fetch("/api/vivino-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Er is een fout opgetreden");
        return;
      }

      setRatings(data.ratings);
      setImportedUsername(data.username);
      setIsMockData(data.mock === true);
    } catch {
      setError(
        "Kon Vivino niet bereiken. Controleer je internetverbinding.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!ratings) return;
    const derived = derivePrefFromRatings(ratings);
    onImport(derived);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleImport();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="relative rounded-2xl border-2 border-gold/40 bg-gold-light p-5 space-y-4"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-text-light hover:text-foreground transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3 pr-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-white">
          <Wine className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Vivino profiel importeren</h3>
          <p className="text-xs text-text-light">
            Vul je Vivino gebruikersnaam in om jouw smaakprofiel te importeren
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Gebruikersnaam of profiellink..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleImport}
          disabled={isLoading || !username.trim()}
          size="md"
          className="shrink-0"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
              />
              Laden...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Importeer
            </span>
          )}
        </Button>
      </div>

      <p className="text-xs text-text-light">
        Voorbeeld: <span className="font-mono">reneweteling</span> of{" "}
        <span className="font-mono">https://www.vivino.com/users/reneweteling</span>
      </p>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3"
          >
            <AlertCircle className="h-4 w-4 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {ratings && ratings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <p className="text-sm font-medium text-success">
                {ratings.length} wijnen gevonden voor @{importedUsername}
              </p>
            </div>

            {isMockData && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Vivino profiel kon niet automatisch worden geladen. Dit zijn voorbeeldgegevens.
                </p>
              </div>
            )}

            {/* Ratings list */}
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-2">
              {ratings.map((rating, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-surface transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {rating.wineName}
                      {rating.vintage ? ` ${rating.vintage}` : ""}
                    </p>
                    <p className="text-xs text-text-light truncate">
                      {[rating.grape, rating.region, rating.country]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                    <span className="text-sm font-semibold text-gold">
                      {rating.rating.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button onClick={handleApply} className="w-full">
              Pas profiel toe op basis van Vivino-geschiedenis
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
