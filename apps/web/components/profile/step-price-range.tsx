"use client";

import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

interface PricePreset {
  label: string;
  min: number;
  max: number;
}

const PRICE_PRESETS: PricePreset[] = [
  { label: "Budget", min: 5, max: 10 },
  { label: "Middensegment", min: 10, max: 25 },
  { label: "Premium", min: 25, max: 50 },
  { label: "Luxe", min: 50, max: 100 },
];

interface StepPriceRangeProps {
  priceMin: number;
  priceMax: number;
  onChange: (min: number, max: number) => void;
}

function formatPrice(value: number): string {
  if (value >= 100) return "€100+";
  return `€${value}`;
}

export function StepPriceRange({
  priceMin,
  priceMax,
  onChange,
}: StepPriceRangeProps) {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseInt(e.target.value, 10);
    if (newMin < priceMax) {
      onChange(newMin, priceMax);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseInt(e.target.value, 10);
    if (newMax > priceMin) {
      onChange(priceMin, newMax);
    }
  };

  const isPresetActive = (preset: PricePreset) =>
    preset.min === priceMin && preset.max === priceMax;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Wat is je prijsrange?
        </h2>
        <p className="text-text-light mt-2">
          Stel in hoeveel je per fles wilt uitgeven.
        </p>
      </div>

      {/* Current price display */}
      <motion.div
        layout
        className="flex items-center justify-center rounded-xl bg-burgundy px-6 py-5 text-white"
      >
        <motion.span
          key={`${priceMin}-${priceMax}`}
          initial={{ scale: 0.9, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-heading text-3xl font-bold"
        >
          {formatPrice(priceMin)} – {formatPrice(priceMax)}
        </motion.span>
      </motion.div>

      {/* Quick preset buttons */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Snelle keuze</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PRICE_PRESETS.map((preset, index) => {
            const active = isPresetActive(preset);
            return (
              <motion.button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.min, preset.max)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={[
                  "rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "border-burgundy bg-burgundy text-white"
                    : "border-border bg-card text-foreground hover:border-burgundy/40",
                ].join(" ")}
              >
                <span className="block font-semibold">{preset.label}</span>
                <span className="block text-xs opacity-75">
                  {formatPrice(preset.min)}–{formatPrice(preset.max)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <Slider
          id="price-min"
          label="Minimumprijs"
          displayValue={formatPrice(priceMin)}
          min={5}
          max={95}
          step={5}
          value={priceMin}
          onChange={handleMinChange}
        />
        <Slider
          id="price-max"
          label="Maximumprijs"
          displayValue={formatPrice(priceMax)}
          min={10}
          max={100}
          step={5}
          value={priceMax}
          onChange={handleMaxChange}
        />
      </div>

      <p className="text-xs text-text-light">
        Wijnen buiten deze range worden niet meegenomen in de aanbevelingen.
      </p>
    </div>
  );
}
