import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GRAPE_GUIDES } from "@/lib/wine-guides";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Druivensoorten — smaak en kenmerken per druif",
  description:
    "Van Chardonnay tot Malbec: ontdek per druivensoort de smaak en kenmerken, en vergelijk de best beoordeelde wijnen bij Nederlandse wijnwinkels.",
  alternates: { canonical: "/druiven" },
  openGraph: {
    title: "Druivensoorten — smaak en kenmerken per druif | WijnVinder",
    description:
      "Ontdek per druivensoort de smaak en kenmerken en vergelijk de beste wijnen.",
    url: `${SITE_URL}/druiven`,
    type: "website",
  },
};

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function DruivenHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Druivensoorten",
            numberOfItems: GRAPE_GUIDES.length,
            itemListElement: GRAPE_GUIDES.map((g, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/druiven/${g.slug}`,
              name: g.name,
            })),
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
            Druiven
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Druivensoorten van A tot Z
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">
            Elke druif heeft zijn eigen smaak en karakter. Kies een druivensoort
            voor uitleg over de stijl en de best beoordeelde wijnen, met de
            scherpste prijs bij Nederlandse wijnwinkels.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {GRAPE_GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/druiven/${g.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-burgundy/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-xl font-semibold text-foreground group-hover:text-burgundy transition-colors">
                  {g.name}
                </h2>
                <ArrowRight className="h-5 w-5 mt-1 text-text-light group-hover:text-burgundy group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <p className="mt-2 text-sm text-text-light leading-relaxed">{g.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
