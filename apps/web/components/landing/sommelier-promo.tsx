import Link from "next/link";
import { ArrowRight, Wine } from "lucide-react";

const EXAMPLE_QUESTIONS = [
  "Wat past bij pulled pork?",
  "Iets feestelijks onder de €15",
  "Een lichte rode voor de zomer",
];

export function SommelierPromo() {
  return (
    <section className="py-20 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Icon */}
          <div className="shrink-0 w-20 h-20 rounded-full bg-burgundy-light flex items-center justify-center shadow-md">
            <Wine className="w-9 h-9 text-burgundy" />
          </div>

          {/* Text block */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block text-gold font-medium text-sm uppercase tracking-widest mb-3">
              AI Sommelier
            </span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Vraag het onze AI-sommelier
            </h2>
            <p className="text-text-light text-lg max-w-xl mb-6 leading-relaxed">
              Vertel wat je eet of naar zoekt en krijg direct passend wijnadvies
              uit ons assortiment. Gratis, zonder account.
            </p>

            {/* Example question chips */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8">
              {EXAMPLE_QUESTIONS.map((q) => (
                <Link
                  key={q}
                  href={`/sommelier`}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-text-light hover:border-burgundy hover:text-burgundy transition-colors"
                >
                  {q}
                </Link>
              ))}
            </div>

            <Link
              href="/sommelier"
              className="inline-flex items-center gap-2 bg-burgundy hover:bg-burgundy/90 text-white font-semibold rounded-full px-6 py-2.5 transition-colors text-sm"
            >
              Stel je vraag
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
