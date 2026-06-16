"use client";

import { clsx } from "clsx";
import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecteer...",
  label,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt.value),
  );

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  const handleSelect = (value: string) => {
    onChange([...selected, value]);
    setSearch("");
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((v) => v !== value));
  };

  return (
    <div className={clsx("relative space-y-1", className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Trigger: behaves like a select. Tapping opens the list without
          popping the keyboard (the search field lives inside the panel). */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={clsx(
          "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-left",
          "focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent",
        )}
      >
        {selectedOptions.length > 0 ? (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-md bg-burgundy-light text-burgundy px-2 py-0.5 text-xs font-medium"
            >
              {opt.label}
              <span
                role="button"
                tabIndex={-1}
                aria-label={`${opt.label} verwijderen`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(opt.value);
                }}
                className="hover:text-burgundy-dark"
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          ))
        ) : (
          <span className="text-sm text-text-light">{placeholder}</span>
        )}
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-text-light shrink-0 ml-auto transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {/* Search field — not auto-focused, so opening on mobile does not
              force the keyboard open. 16px font prevents iOS focus-zoom. */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-text-light shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoeken..."
              className="w-full bg-transparent text-base outline-none placeholder:text-text-light"
            />
          </div>
          {filteredOptions.length > 0 ? (
            <div className="max-h-56 overflow-auto overscroll-contain">
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-surface transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-3 text-sm text-text-light">Niets gevonden.</p>
          )}
        </div>
      )}
    </div>
  );
}
