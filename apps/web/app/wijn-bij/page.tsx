import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FOOD_PAIRINGS } from "@/lib/food-pairings";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wijn bij gerecht — welke wijn past waarbij?",
  description:
    "Welke wijn past bij jouw gerecht? Van lamsvlees tot sushi: ontdek per gerecht de beste wijn en vergelijk prijzen bij Nederlandse wijnwinkels.",
  alternates: { canonical: "/wijn-bij" },
  openGraph: {
    title: "Wijn bij gerecht — welke wijn past waarbij? | WijnVinder",
    description:
      "Ontdek per gerecht de beste wijn en vergelijk prijzen bij Nederlandse wijnwinkels.",
    url: `${SITE_URL}/wijn-bij`,
    type: "website",
  },
};

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function WijnBijHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Wijn bij gerecht",
            numberOfItems: FOOD_PAIRINGS.length,
            itemListElement: FOOD_PAIRINGS.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/wijn-bij/${p.slug}`,
              name: p.question,
            })),
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
            Wijnspijs
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Welke wijn past bij jouw gerecht?
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">
            De juiste wijn maakt een gerecht compleet. Kies hieronder je gerecht
            voor concreet advies en de best beoordeelde wijnen die erbij passen,
            met de scherpste prijs bij Nederlandse wijnwinkels.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FOOD_PAIRINGS.map((p) => (
            <Link
              key={p.slug}
              href={`/wijn-bij/${p.slug}`}
              className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-burgundy/40 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-heading text-lg font-semibold text-foreground group-hover:text-burgundy transition-colors">
                  {p.label}
                </h2>
                <ArrowRight className="h-4 w-4 text-text-light group-hover:text-burgundy transition-colors shrink-0" />
              </div>
              <p className="mt-1.5 text-sm text-text-light line-clamp-2">{p.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
