"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, SlidersHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MultiSelect } from "@/components/ui/multi-select";
import { WINE_TYPES, GRAPES, COUNTRIES } from "@/lib/constants";
import type { WineType } from "@/lib/types";

export type WineFilters = {
  types: WineType[];
  grapes: string[];
  countries: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
};

type WineFiltersProps = {
  filters: WineFilters;
  onChange: (filters: WineFilters) => void;
  hasProfile?: boolean;
  onApplyProfile?: () => void;
};

const grapeOptions = GRAPES.map((g) => ({ value: g, label: g }));
const countryOptions = COUNTRIES.map((c) => ({ value: c.value, label: c.label }));

function FilterPanel({
  filters,
  onChange,
  onClose,
  hasProfile,
  onApplyProfile,
}: WineFiltersProps & { onClose?: () => void }) {
  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.grapes.length > 0 ||
    filters.countries.length > 0 ||
    filters.priceMin > 5 ||
    filters.priceMax < 200 ||
    filters.minRating > 3;

  const handleClear = () => {
    onChange({
      types: [],
      grapes: [],
      countries: [],
      priceMin: 5,
      priceMax: 200,
      minRating: 3,
    });
  };

  const toggleType = (type: WineType) => {
    const next = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: next });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-burgundy" />
          <span className="font-semibold text-foreground">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Wis filters
            </Button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface transition-colors lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Apply profile button */}
      {hasProfile && onApplyProfile && (
        <Button
          variant="outline"
          size="sm"
          onClick={onApplyProfile}
          className="w-full flex items-center justify-center gap-2"
        >
          <User className="h-3.5 w-3.5" />
          Gebruik mijn profiel
        </Button>
      )}

      {/* Wine type toggles */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Wijntype</p>
        <div className="flex flex-wrap gap-2">
          {WINE_TYPES.map((type) => {
            const active = filters.types.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-burgundy text-white"
                    : "bg-surface text-foreground hover:bg-burgundy-light"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grape multi-select */}
      <div className="relative">
        <MultiSelect
          label="Druivensoort"
          options={grapeOptions}
          selected={filters.grapes}
          onChange={(grapes) => onChange({ ...filters, grapes })}
          placeholder="Selecteer druivensoort..."
        />
      </div>

      {/* Country multi-select */}
      <div className="relative">
        <MultiSelect
          label="Land"
          options={countryOptions}
          selected={filters.countries}
          onChange={(countries) => onChange({ ...filters, countries })}
          placeholder="Selecteer land..."
        />
      </div>

      {/* Price range */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Prijsbereik</p>
        <div className="space-y-3">
          <Slider
            id="price-min"
            label="Minimum prijs"
            displayValue={`€${filters.priceMin}`}
            min={0}
            max={filters.priceMax - 1}
            step={1}
            value={filters.priceMin}
            onChange={(e) =>
              onChange({ ...filters, priceMin: Number(e.target.value) })
            }
          />
          <Slider
            id="price-max"
            label="Maximum prijs"
            displayValue={`€${filters.priceMax}`}
            min={filters.priceMin + 1}
            max={200}
            step={1}
            value={filters.priceMax}
            onChange={(e) =>
              onChange({ ...filters, priceMax: Number(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Min score */}
      <div>
        <Slider
          id="min-rating"
          label="Minimale score"
          displayValue={`${filters.minRating.toFixed(1)}`}
          min={1}
          max={5}
          step={0.1}
          value={filters.minRating}
          onChange={(e) =>
            onChange({ ...filters, minRating: Number(e.target.value) })
          }
        />
      </div>
    </div>
  );
}

export function WineFilters({ filters, onChange, hasProfile, onApplyProfile }: WineFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount =
    filters.types.length +
    filters.grapes.length +
    filters.countries.length +
    (filters.priceMin > 5 || filters.priceMax < 200 ? 1 : 0) +
    (filters.minRating > 3 ? 1 : 0);

  return (
    <>
      {/* Mobile trigger — rendered outside flex in parent, but kept here for self-containment */}
      <div className="lg:hidden absolute top-0 right-0">
        <Button
          variant="outline"
          size="md"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 bg-burgundy text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto">
          <FilterPanel filters={filters} onChange={onChange} hasProfile={hasProfile} onApplyProfile={onApplyProfile} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 right-0 w-80 max-w-full bg-card shadow-xl z-50 overflow-y-auto lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-5">
                <FilterPanel
                  filters={filters}
                  onChange={onChange}
                  onClose={() => setMobileOpen(false)}
                  hasProfile={hasProfile}
                  onApplyProfile={onApplyProfile}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
