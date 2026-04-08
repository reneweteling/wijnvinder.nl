"use client";

import { ArrowUpDown } from "lucide-react";

export type SortOption =
  | "match"
  | "price-asc"
  | "price-desc"
  | "rating-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "match", label: "Beste match" },
  { value: "price-asc", label: "Prijs laag → hoog" },
  { value: "price-desc", label: "Prijs hoog → laag" },
  { value: "rating-desc", label: "Vivino score" },
];

type SortControlsProps = {
  value: SortOption;
  onChange: (value: SortOption) => void;
  total?: number;
};

export function SortControls({ value, onChange, total }: SortControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {total != null && (
        <p className="text-sm text-text-light">
          <span className="font-semibold text-foreground">{total}</span>{" "}
          {total === 1 ? "wijn gevonden" : "wijnen gevonden"}
        </p>
      )}

      <div className="flex items-center gap-2 ml-auto">
        <ArrowUpDown className="h-4 w-4 text-text-light shrink-0" />
        <label htmlFor="sort-select" className="text-sm text-text-light sr-only">
          Sorteren op
        </label>
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="text-sm border border-border rounded-lg px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
