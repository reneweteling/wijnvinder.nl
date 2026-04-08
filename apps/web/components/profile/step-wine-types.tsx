"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { WINE_TYPES } from "@/lib/constants";
import type { WineType } from "@/lib/types";

const WINE_TYPE_ICONS: Record<WineType, string> = {
  red: "🍷",
  white: "🥂",
  rose: "🌸",
  sparkling: "🍾",
};

const WINE_TYPE_DESCRIPTIONS: Record<WineType, string> = {
  red: "Vol, krachtig en complex",
  white: "Fris, elegant en veelzijdig",
  rose: "Licht, fruitig en zomers",
  sparkling: "Bubbels voor elk moment",
};

const WINE_TYPE_COLORS: Record<WineType, { bg: string; border: string; selected: string }> = {
  red: {
    bg: "bg-red-50",
    border: "border-red-100",
    selected: "border-burgundy bg-burgundy-light",
  },
  white: {
    bg: "bg-yellow-50",
    border: "border-yellow-100",
    selected: "border-gold bg-gold-light",
  },
  rose: {
    bg: "bg-pink-50",
    border: "border-pink-100",
    selected: "border-pink-400 bg-pink-50",
  },
  sparkling: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    selected: "border-amber-400 bg-amber-50",
  },
};

interface StepWineTypesProps {
  selected: WineType[];
  onChange: (types: WineType[]) => void;
}

export function StepWineTypes({ selected, onChange }: StepWineTypesProps) {
  const toggle = (type: WineType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Welke wijntypes drink je graag?
        </h2>
        <p className="text-text-light mt-2">
          Selecteer een of meerdere soorten. Je kunt altijd later aanpassen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {WINE_TYPES.map((type, index) => {
          const isSelected = selected.includes(type.value);
          const colors = WINE_TYPE_COLORS[type.value];

          return (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => toggle(type.value)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-left transition-all duration-200",
                isSelected
                  ? colors.selected + " shadow-md"
                  : colors.bg + " " + colors.border + " hover:shadow-sm",
              ].join(" ")}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-burgundy text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                </motion.div>
              )}

              <span className="text-4xl">{WINE_TYPE_ICONS[type.value]}</span>

              <div className="text-center">
                <p className="font-semibold text-foreground">{type.label}</p>
                <p className="text-xs text-text-light mt-0.5">
                  {WINE_TYPE_DESCRIPTIONS[type.value]}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-center text-text-light">
          Selecteer minimaal één wijntype om door te gaan
        </p>
      )}
    </div>
  );
}
