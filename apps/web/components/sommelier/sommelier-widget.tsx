"use client";

import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Send, Wine, Info } from "lucide-react";
import { WineCard } from "@/components/wines/wine-card";
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  subscribeProfile,
} from "@/lib/profile-cookie";
import type { WineCardWine, WineProfileData } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TraditionalResult = { text: string; wines: WineCardWine[] };
type PersonalResult = { text: string; wines: WineCardWine[] };

type SommelierResponse =
  | { offTopic: true; message: string }
  | { traditional: TraditionalResult; personal: PersonalResult | null; remaining: number };

type QuotaError = {
  isQuota: true;
  message: string;
  loginCta: boolean;
};

type QuotaInfo = { used: number; limit: number; remaining: number };

// ---------------------------------------------------------------------------
// Example chips
// ---------------------------------------------------------------------------

const EXAMPLES = [
  "Wat past er bij garnalen in knoflookboter?",
  "Een rode wijn voor bij de barbecue",
  "Iets feestelijks onder de €15",
  "Welke wijn past bij een kaasplankje?",
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AdviceCard({
  label,
  text,
  wines,
  delay = 0,
}: {
  label: string;
  text: string;
  wines: WineCardWine[];
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border bg-surface">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-burgundy">
          <Wine className="h-3.5 w-3.5" />
          {label}
        </span>
      </div>
      <div className="px-5 py-4 space-y-4">
        <p className="text-foreground leading-relaxed">{text}</p>
        {wines.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {wines.map((wine, i) => (
              <WineCard key={wine.id} wine={wine} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Widget
// ---------------------------------------------------------------------------

export interface SommelierWidgetProps {
  variant?: "full" | "compact";
}

export function SommelierWidget({ variant = "full" }: SommelierWidgetProps) {
  const profile = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    getServerProfileSnapshot
  );

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SommelierResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaError, setQuotaError] = useState<QuotaError | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isCompact = variant === "compact";
  const exampleChips = isCompact ? EXAMPLES.slice(0, 2) : EXAMPLES;

  // Fetch quota on mount (no LLM call, no quota consumption)
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/sommelier/quota");
        if (res.ok) {
          const data = (await res.json()) as QuotaInfo;
          setQuota(data);
        }
      } catch {
        // Non-critical — quota counter stays hidden on error
      }
    })();
  }, []);

  const charCount = question.length;
  const canSubmit = charCount >= 3 && charCount <= 300 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setQuotaError(null);

    try {
      const res = await fetch("/api/sommelier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          profile: profile as WineProfileData | null,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        message?: string;
        loginCta?: boolean;
        remaining?: number;
      } & Partial<SommelierResponse>;

      if (!res.ok) {
        if (data.error === "quota") {
          setQuotaError({
            isQuota: true,
            message: data.message ?? "Daglimiet bereikt.",
            loginCta: data.loginCta ?? false,
          });
          return;
        }
        setError(data.error ?? "Er is iets misgegaan. Probeer het opnieuw.");
        return;
      }

      setResult(data as SommelierResponse);
      // Update quota counter from POST response
      if (typeof data.remaining === "number" && quota !== null) {
        setQuota({ ...quota, remaining: data.remaining, used: quota.limit - data.remaining });
      }
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Er is iets misgegaan. Controleer je verbinding en probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  function fillExample(example: string) {
    setQuestion(example);
    setResult(null);
    setError(null);
    setQuotaError(null);
  }

  return (
    <div className={isCompact ? "space-y-3" : "max-w-3xl mx-auto px-4 py-8 space-y-8"}>
      {/* Profile hint (full only) */}
      {!isCompact && !profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gold/30 bg-gold/5 px-5 py-3 text-sm text-amber-800 flex items-center justify-between gap-3"
        >
          <span>Wil je persoonlijk advies op basis van jouw smaak?</span>
          <Link
            href="/profiel"
            className="shrink-0 font-medium underline underline-offset-2 hover:text-burgundy transition-colors"
          >
            Maak een smaakprofiel
          </Link>
        </motion.div>
      )}

      {/* Question form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="space-y-3"
      >
        {/* Example chips */}
        <div className="flex flex-wrap gap-2">
          {exampleChips.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => fillExample(ex)}
              className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-text-light hover:border-burgundy hover:text-burgundy transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={300}
            rows={isCompact ? 2 : 3}
            placeholder="Ik eet vanavond garnalen in knoflookboter, wat past hierbij?"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-text-light resize-none focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy transition-colors pr-14 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void handleSubmit(e as unknown as React.FormEvent);
              }
            }}
          />
          <span
            className={`absolute bottom-3 right-4 text-xs tabular-nums ${
              charCount > 280
                ? "text-red-500"
                : charCount > 240
                  ? "text-amber-500"
                  : "text-text-light"
            }`}
          >
            {charCount}/300
          </span>
        </div>

        {/* Quota counter (below textarea, before submit) */}
        {quota !== null && (
          <div className="flex items-center gap-1 text-xs text-text-light">
            <span>{quota.used}/{quota.limit} vragen vandaag</span>
            <span className="group relative inline-flex">
              <Info className="w-3.5 h-3.5 cursor-default" aria-label="Quotum uitleg" />
              <span
                className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 rounded-lg bg-foreground/90 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 text-center"
                role="tooltip"
              >
                Als gast kun je 3 vragen per dag stellen. Met een gratis account zijn dat er 20.
              </span>
            </span>
          </div>
        )}

        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full px-6 py-2.5 transition-colors text-sm"
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                De sommelier denkt na...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Vraag advies
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Quota error */}
      {quotaError && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-burgundy/20 bg-burgundy/5 px-5 py-5 space-y-4"
        >
          <p className="text-sm text-foreground leading-relaxed">{quotaError.message}</p>
          {quotaError.loginCta && (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full bg-burgundy text-white text-sm font-semibold px-5 py-2 hover:bg-burgundy/90 transition-colors"
              >
                Inloggen
              </Link>
              <Link
                href="/registreren"
                className="inline-flex items-center gap-1.5 rounded-full border border-burgundy text-burgundy text-sm font-semibold px-5 py-2 hover:bg-burgundy/5 transition-colors"
              >
                Gratis aanmelden
              </Link>
            </div>
          )}
        </motion.div>
      )}

      {/* Generic error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Results */}
      <div ref={resultsRef} className="space-y-5">
        {result && "offTopic" in result && result.offTopic && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-5"
          >
            <div className="flex items-start gap-3">
              <Wine className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-amber-800 leading-relaxed">{result.message}</p>
            </div>
          </motion.div>
        )}

        {result && "traditional" in result && (
          <>
            <AdviceCard
              label="Klassiek advies"
              text={result.traditional.text}
              wines={result.traditional.wines}
              delay={0}
            />
            {result.personal && (
              <AdviceCard
                label="Voor jouw smaakprofiel"
                text={result.personal.text}
                wines={result.personal.wines}
                delay={0.15}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
