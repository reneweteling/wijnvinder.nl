"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Render-time adjustment: when the controlled value changes from outside
  // (e.g. URL navigation), reset draft during this render cycle.
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }

  const handleChange = (next: string) => {
    setDraft(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), 350);
  };

  const handleClear = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraft("");
    onChange("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light pointer-events-none" />
      <input
        type="search"
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? "Zoek op naam, druif, regio of producent..."}
        className="w-full h-11 rounded-xl border border-border bg-card pl-10 pr-10 text-sm text-foreground placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent [&::-webkit-search-cancel-button]:hidden"
        aria-label="Zoek wijnen"
      />
      {draft && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-text-light hover:text-foreground hover:bg-surface transition-colors"
          aria-label="Zoekopdracht wissen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
