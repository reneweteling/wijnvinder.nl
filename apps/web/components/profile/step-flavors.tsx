"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { FLAVORS } from "@/lib/constants";
import type { FlavorProfile } from "@/lib/types";

const FLAVOR_ICONS: Record<FlavorProfile, string> = {
  fruity: "🍓",
  dry: "🌵",
  tannic: "🍂",
  oaky: "🪵",
  mineral: "⛰️",
  spicy: "🌶️",
  floral: "🌸",
  earthy: "🌍",
};

const FLAVOR_DESCRIPTIONS: Record<FlavorProfile, string> = {
  fruity: "Bessen, kersen, citrus",
  dry: "Weinig restsuiker",
  tannic: "Strak en krachtig",
  oaky: "Vanille, kokosnoot",
  mineral: "Krijt, vuursteen",
  spicy: "Peper, specerijen",
  floral: "Rozen, lavendel",
  earthy: "Leer, paddenstoelen",
};

interface StepFlavorsProps {
  selected: FlavorProfile[];
  onChange: (flavors: FlavorProfile[]) => void;
}

export function StepFlavors({ selected, onChange }: StepFlavorsProps) {
  const toggle = (flavor: FlavorProfile) => {
    if (selected.includes(flavor)) {
      onChange(selected.filter((f) => f !== flavor));
    } else {
      onChange([...selected, flavor]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Welke smaakprofielen spreken je aan?
        </h2>
        <p className="text-text-light mt-2">
          Meerdere keuzes zijn mogelijk. Hoe meer je aangeeft, hoe beter de aanbevelingen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FLAVORS.map((flavor, index) => {
          const isSelected = selected.includes(flavor.value);

          return (
            <motion.button
              key={flavor.value}
              type="button"
              onClick={() => toggle(flavor.value)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06, duration: 0.25 }}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={[
                "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 text-center",
                isSelected
                  ? "border-burgundy bg-burgundy-light shadow-md"
                  : "border-border bg-card hover:border-burgundy/40 hover:shadow-sm",
              ].join(" ")}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-burgundy text-white"
                >
                  <Check className="h-3 w-3" />
                </motion.div>
              )}

              <span className="text-3xl">{FLAVOR_ICONS[flavor.value]}</span>

              <div>
                <p
                  className={[
                    "text-sm font-semibold",
                    isSelected ? "text-burgundy" : "text-foreground",
                  ].join(" ")}
                >
                  {flavor.label}
                </p>
                <p className="text-xs text-text-light mt-0.5 leading-tight">
                  {FLAVOR_DESCRIPTIONS[flavor.value]}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-sm text-center text-text-light">
          Selecteer de smaken die jij het lekkerst vindt
        </p>
      )}

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-surface px-4 py-3"
        >
          <p className="text-sm text-text-light">
            <span className="font-medium text-burgundy">{selected.length}</span>{" "}
            smaakprofiel{selected.length !== 1 ? "en" : ""} geselecteerd:{" "}
            {selected
              .map((f) => FLAVORS.find((fl) => fl.value === f)?.label)
              .filter(Boolean)
              .join(", ")}
          </p>
        </motion.div>
      )}
    </div>
  );
}
