"use client";

import { motion } from "framer-motion";
import { MultiSelect } from "@/components/ui/multi-select";
import { GRAPES } from "@/lib/constants";

// Split grapes into red and white categories
const RED_GRAPES = [
  "Cabernet Sauvignon",
  "Merlot",
  "Pinot Noir",
  "Syrah/Shiraz",
  "Tempranillo",
  "Sangiovese",
  "Nebbiolo",
  "Malbec",
  "Zinfandel",
  "Grenache/Garnacha",
  "Mourvèdre",
  "Barbera",
  "Carménère",
  "Pinotage",
  "Primitivo",
  "Petit Verdot",
  "Cabernet Franc",
  "Gamay",
  "Touriga Nacional",
  "Montepulciano",
];

const WHITE_GRAPES = [
  "Chardonnay",
  "Sauvignon Blanc",
  "Riesling",
  "Pinot Grigio/Pinot Gris",
  "Gewürztraminer",
  "Viognier",
  "Chenin Blanc",
  "Sémillon",
  "Muscat/Moscato",
  "Grüner Veltliner",
  "Albariño",
  "Verdejo",
  "Torrontés",
  "Vermentino",
  "Trebbiano",
  "Garganega",
  "Fiano",
  "Assyrtiko",
  "Godello",
  "Marsanne",
  "Roussanne",
  "Melon de Bourgogne",
];

const POPULAR_RED = ["Cabernet Sauvignon", "Merlot", "Pinot Noir", "Syrah/Shiraz", "Tempranillo", "Malbec"];
const POPULAR_WHITE = ["Chardonnay", "Sauvignon Blanc", "Riesling", "Pinot Grigio/Pinot Gris"];

const ALL_GRAPE_OPTIONS = GRAPES.map((g) => ({ value: g, label: g }));

interface StepGrapesProps {
  selected: string[];
  onChange: (grapes: string[]) => void;
}

export function StepGrapes({ selected, onChange }: StepGrapesProps) {
  const toggleGrape = (grape: string) => {
    if (selected.includes(grape)) {
      onChange(selected.filter((g) => g !== grape));
    } else {
      onChange([...selected, grape]);
    }
  };

  const QuickBadge = ({
    grape,
    color,
    index,
  }: {
    grape: string;
    color: "red" | "white";
    index: number;
  }) => {
    const isSelected = selected.includes(grape);
    return (
      <motion.button
        type="button"
        key={grape}
        onClick={() => toggleGrape(grape)}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        whileTap={{ scale: 0.95 }}
        className={[
          "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 border",
          isSelected
            ? color === "red"
              ? "bg-burgundy text-white border-burgundy"
              : "bg-gold text-white border-gold"
            : color === "red"
              ? "bg-burgundy-light text-burgundy border-burgundy/20 hover:border-burgundy/50"
              : "bg-gold-light text-gold border-gold/20 hover:border-gold/50",
        ].join(" ")}
      >
        {grape}
      </motion.button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Welke druivensoorten heb je liever?
        </h2>
        <p className="text-text-light mt-2">
          Klik op populaire druiven of zoek via het zoekveld hieronder.
        </p>
      </div>

      {/* Popular red grapes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-burgundy">🍷 Populaire rode druiven</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_RED.map((grape, i) => (
            <QuickBadge key={grape} grape={grape} color="red" index={i} />
          ))}
        </div>
      </div>

      {/* Popular white grapes */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gold">🥂 Populaire witte druiven</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_WHITE.map((grape, i) => (
            <QuickBadge key={grape} grape={grape} color="white" index={i} />
          ))}
        </div>
      </div>

      {/* Full multi-select */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Zoek alle druivensoorten</p>
        <div className="relative">
          <MultiSelect
            options={ALL_GRAPE_OPTIONS}
            selected={selected}
            onChange={onChange}
            placeholder="Zoek en selecteer druiven..."
          />
        </div>
      </div>

      {selected.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-light"
        >
          {selected.length} druivensoort{selected.length !== 1 ? "en" : ""} geselecteerd
        </motion.p>
      )}

      {selected.length === 0 && (
        <p className="text-sm text-text-light">
          Geen voorkeur? Sla deze stap over.
        </p>
      )}
    </div>
  );
}

// Export for grouping reference
export { RED_GRAPES, WHITE_GRAPES };
