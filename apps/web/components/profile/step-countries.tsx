"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { COUNTRIES } from "@/lib/constants";

const COUNTRY_FLAGS: Record<string, string> = {
  france: "🇫🇷",
  italy: "🇮🇹",
  spain: "🇪🇸",
  portugal: "🇵🇹",
  germany: "🇩🇪",
  austria: "🇦🇹",
  greece: "🇬🇷",
  usa: "🇺🇸",
  argentina: "🇦🇷",
  chile: "🇨🇱",
  australia: "🇦🇺",
  "new-zealand": "🇳🇿",
  "south-africa": "🇿🇦",
  hungary: "🇭🇺",
  romania: "🇷🇴",
};

interface StepCountriesProps {
  selected: string[];
  onChange: (countries: string[]) => void;
}

export function StepCountries({ selected, onChange }: StepCountriesProps) {
  const toggle = (country: string) => {
    if (selected.includes(country)) {
      onChange(selected.filter((c) => c !== country));
    } else {
      onChange([...selected, country]);
    }
  };

  const selectAll = () => {
    onChange(COUNTRIES.map((c) => c.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Uit welke landen drink je graag wijn?
        </h2>
        <p className="text-text-light mt-2">
          Laat leeg als je geen voorkeur hebt voor een bepaald land.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs font-medium text-burgundy underline-offset-2 hover:underline"
        >
          Alles selecteren
        </button>
        <span className="text-text-light">·</span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs font-medium text-text-light underline-offset-2 hover:underline"
        >
          Wissen
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COUNTRIES.map((country, index) => {
          const isSelected = selected.includes(country.value);
          const flag = COUNTRY_FLAGS[country.value] || "🌍";

          return (
            <motion.button
              key={country.value}
              type="button"
              onClick={() => toggle(country.value)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.04, duration: 0.2 }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={[
                "relative flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150",
                isSelected
                  ? "border-burgundy bg-burgundy-light shadow-sm"
                  : "border-border bg-card hover:border-burgundy/30 hover:shadow-sm",
              ].join(" ")}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-white"
                >
                  <Check className="h-3 w-3" />
                </motion.div>
              )}

              <span className="text-2xl">{flag}</span>

              <span
                className={[
                  "text-sm font-medium",
                  isSelected ? "text-burgundy" : "text-foreground",
                ].join(" ")}
              >
                {country.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selected.length > 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-light"
        >
          {selected.length} land{selected.length !== 1 ? "en" : ""} geselecteerd
        </motion.p>
      ) : (
        <p className="text-sm text-text-light">
          Geen land geselecteerd — wijnen van alle landen worden aanbevolen
        </p>
      )}
    </div>
  );
}
