"use client";

import { motion } from "framer-motion";
import { Wine, Grape, Sparkles, MapPin, EuroIcon } from "lucide-react";
import { WINE_TYPES, FLAVORS, COUNTRIES } from "@/lib/constants";
import type { WineProfileData } from "@/lib/types";

interface StepSummaryProps {
  profile: WineProfileData;
  onEditStep: (step: number) => void;
}

const WINE_TYPE_ICONS: Record<string, string> = {
  red: "🍷",
  white: "🥂",
  rose: "🌸",
  sparkling: "🍾",
};

function SummarySection({
  icon,
  title,
  content,
  onEdit,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  onEdit: () => void;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-burgundy-light text-burgundy">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-text-light uppercase tracking-wide">
          {title}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground leading-relaxed">
          {content}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs font-medium text-burgundy hover:underline underline-offset-2"
      >
        Wijzigen
      </button>
    </motion.div>
  );
}

export function StepSummary({ profile, onEditStep }: StepSummaryProps) {
  const wineTypeLabels = profile.wineTypes
    .map((t) => {
      const found = WINE_TYPES.find((wt) => wt.value === t);
      return found ? `${WINE_TYPE_ICONS[t]} ${found.label}` : t;
    })
    .join(", ");

  const flavorLabels = profile.flavors
    .map((f) => FLAVORS.find((fl) => fl.value === f)?.label ?? f)
    .join(", ");

  const countryLabels = profile.countries
    .map((c) => COUNTRIES.find((co) => co.value === c)?.label ?? c)
    .join(", ");

  const priceLabel =
    profile.priceMax >= 100
      ? `€${profile.priceMin} – €100+`
      : `€${profile.priceMin} – €${profile.priceMax}`;

  const completedSections = [
    profile.wineTypes.length > 0,
    profile.grapes.length > 0,
    profile.flavors.length > 0,
    true, // price always has a value
    profile.countries.length > 0,
  ].filter(Boolean).length;

  const completionPercent = Math.round((completedSections / 5) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-foreground">
          Jouw smaakprofiel
        </h2>
        <p className="text-text-light mt-2">
          Controleer je keuzes en pas ze eventueel aan.
        </p>
      </div>

      {/* Completion indicator */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-surface p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Profiel volledigheid
          </span>
          <span className="text-sm font-bold text-burgundy">
            {completionPercent}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="h-full rounded-full bg-burgundy"
          />
        </div>
      </motion.div>

      <div className="space-y-3">
        <SummarySection
          icon={<Wine className="h-5 w-5" />}
          title="Wijnsoorten"
          content={wineTypeLabels || "Niet ingesteld"}
          onEdit={() => onEditStep(0)}
          delay={0.1}
        />
        <SummarySection
          icon={<Grape className="h-5 w-5" />}
          title="Druivensoorten"
          content={
            profile.grapes.length > 0
              ? profile.grapes.slice(0, 5).join(", ") +
                (profile.grapes.length > 5
                  ? ` +${profile.grapes.length - 5} meer`
                  : "")
              : "Geen voorkeur"
          }
          onEdit={() => onEditStep(1)}
          delay={0.15}
        />
        <SummarySection
          icon={<Sparkles className="h-5 w-5" />}
          title="Smaakprofielen"
          content={flavorLabels || "Niet ingesteld"}
          onEdit={() => onEditStep(2)}
          delay={0.2}
        />
        <SummarySection
          icon={<EuroIcon className="h-5 w-5" />}
          title="Prijsrange"
          content={priceLabel}
          onEdit={() => onEditStep(3)}
          delay={0.25}
        />
        <SummarySection
          icon={<MapPin className="h-5 w-5" />}
          title="Landen"
          content={
            profile.countries.length > 0
              ? countryLabels
              : "Alle landen"
          }
          onEdit={() => onEditStep(4)}
          delay={0.3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl bg-burgundy-light border border-burgundy/20 p-4"
      >
        <p className="text-sm text-burgundy">
          <span className="font-semibold">Je profiel is klaar!</span> Klik op
          &ldquo;Bekijk aanbevelingen&rdquo; om persoonlijke wijnsuggesties te
          ontvangen op basis van jouw smaakprofiel.
        </p>
      </motion.div>
    </div>
  );
}
