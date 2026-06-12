import Link from "next/link";
import { ArrowRight } from "lucide-react";

const EXAMPLE_QUESTIONS = [
  "Wat past bij pulled pork?",
  "Iets feestelijks onder de €15",
  "Een lichte rode voor de zomer",
  "Wat serveer ik bij vis?",
  "Dessertwijnen aanbevelen",
];

export function SommelierPromo() {
  return (
    <section className="py-20 sm:py-24 bg-background border-y border-border relative overflow-hidden">
      {/* Subtle decorative rings */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gold/[0.04] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-burgundy/[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header — same pattern as how-it-works and features-section */}
        <div className="text-center mb-10">
          <span className="inline-block text-gold font-medium text-sm uppercase tracking-widest mb-3">
            AI Sommelier
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mb-5">
            Vraag Maurice, onze AI-sommelier
          </h2>
          <div className="w-16 h-[2px] bg-gradient-to-r from-gold/60 to-gold/20 mx-auto mb-5" />
          <p className="text-text-light text-lg max-w-2xl mx-auto leading-relaxed">
            Vertel wat je eet of waar je naar zoekt en krijg direct passend
            wijnadvies uit ons assortiment. Gratis, zonder account.
          </p>
        </div>

        {/* Example question chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-9">
          {EXAMPLE_QUESTIONS.map((q) => (
            <Link
              key={q}
              href="/sommelier"
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-light hover:border-burgundy hover:text-burgundy transition-colors whitespace-nowrap"
            >
              {q}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link
            href="/sommelier"
            className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy/90 text-white font-semibold rounded-full px-7 py-3 transition-colors text-sm"
          >
            Vraag het Maurice
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
