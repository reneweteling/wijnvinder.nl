"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wine,
  Import,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWineProfile } from "@/lib/hooks/use-wine-profile";
import { StepWineTypes } from "./step-wine-types";
import { StepGrapes } from "./step-grapes";
import { StepFlavors } from "./step-flavors";
import { StepPriceRange } from "./step-price-range";
import { StepCountries } from "./step-countries";
import { StepSummary } from "./step-summary";
import { VivinoImport } from "./vivino-import";
import type { WineProfileData, WineType, FlavorProfile } from "@/lib/types";

const STEPS = [
  { id: "wine-types", label: "Wijnsoorten" },
  { id: "grapes", label: "Druiven" },
  { id: "flavors", label: "Smaken" },
  { id: "prijs", label: "Prijs" },
  { id: "landen", label: "Landen" },
  { id: "overzicht", label: "Overzicht" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

export function ProfileWizard() {
  const router = useRouter();
  const { profile, updateProfile, saveProfile, isLoading } = useWineProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showVivinoImport, setShowVivinoImport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    await saveProfile();
    setIsSaving(false);
    router.push("/aanbevelingen");
  };

  const handleVivinoImport = (data: Partial<WineProfileData>) => {
    updateProfile(data);
    setShowVivinoImport(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.wineTypes.length > 0;
      default:
        return true;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="h-8 w-8 rounded-full border-3 border-burgundy border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Vivino Import Banner */}
      <AnimatePresence>
        {!showVivinoImport && (
          <motion.button
            type="button"
            onClick={() => setShowVivinoImport(true)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="group flex w-full items-center gap-3 rounded-xl border border-gold/40 bg-gold-light px-4 py-3 text-left transition-all hover:border-gold/60 hover:bg-gold-light/80"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-white group-hover:scale-105 transition-transform">
              <Wine className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Heb je een Vivino account?
              </p>
              <p className="text-xs text-text-light">
                Importeer je profielgegevens automatisch
              </p>
            </div>
            <Import className="h-4 w-4 text-gold" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVivinoImport && (
          <VivinoImport
            onImport={handleVivinoImport}
            onClose={() => setShowVivinoImport(false)}
          />
        )}
      </AnimatePresence>

      {/* Wizard card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Step progress bar */}
        <div className="border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-text-light uppercase tracking-wider">
              Stap {currentStep + 1} van {STEPS.length}
            </span>
            <span className="text-xs font-medium text-burgundy">
              {STEPS[currentStep].label}
            </span>
          </div>

          {/* Progress indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <motion.button
                key={step.id}
                type="button"
                onClick={() => i < currentStep && goToStep(i)}
                disabled={i > currentStep}
                className="flex-1 h-1.5 rounded-full overflow-hidden bg-border cursor-default disabled:cursor-default"
                title={i <= currentStep ? step.label : undefined}
              >
                <motion.div
                  initial={false}
                  animate={{
                    width:
                      i < currentStep
                        ? "100%"
                        : i === currentStep
                          ? "100%"
                          : "0%",
                    backgroundColor:
                      i < currentStep
                        ? "var(--gold)"
                        : "var(--burgundy)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full rounded-full"
                  style={{
                    width: i <= currentStep ? "100%" : "0%",
                  }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="p-6"
            >
              {currentStep === 0 && (
                <StepWineTypes
                  selected={profile.wineTypes}
                  onChange={(types) =>
                    updateProfile({ wineTypes: types as WineType[] })
                  }
                />
              )}
              {currentStep === 1 && (
                <StepGrapes
                  selected={profile.grapes}
                  onChange={(grapes) => updateProfile({ grapes })}
                />
              )}
              {currentStep === 2 && (
                <StepFlavors
                  selected={profile.flavors}
                  onChange={(flavors) =>
                    updateProfile({ flavors: flavors as FlavorProfile[] })
                  }
                />
              )}
              {currentStep === 3 && (
                <StepPriceRange
                  priceMin={profile.priceMin}
                  priceMax={profile.priceMax}
                  onChange={(min, max) =>
                    updateProfile({ priceMin: min, priceMax: max })
                  }
                />
              )}
              {currentStep === 4 && (
                <StepCountries
                  selected={profile.countries}
                  onChange={(countries) => updateProfile({ countries })}
                />
              )}
              {currentStep === 5 && (
                <StepSummary profile={profile} onEditStep={goToStep} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>

            <div className="flex items-center gap-2">
              {/* Skip option for optional steps */}
              {currentStep > 0 && !isLastStep && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={nextStep}
                  className="text-text-light hover:text-foreground"
                >
                  Overslaan
                </Button>
              )}

              {isLastStep ? (
                <Button
                  size="lg"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      Opslaan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Bekijk Aanbevelingen
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="md"
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  Volgende
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
