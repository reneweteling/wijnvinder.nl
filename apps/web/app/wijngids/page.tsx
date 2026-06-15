import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COLLECTION_GUIDES } from "@/lib/wine-collections";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wijngids — selecties, wijntypes en aanbiedingen",
  description:
    "Van de best beoordeelde wijnen tot wijn onder €10 en de scherpste aanbiedingen: vind snel de juiste selectie en vergelijk prijzen.",
  alternates: { canonical: "/wijngids" },
  openGraph: {
    title: "Wijngids — selecties, wijntypes en aanbiedingen | WijnVinder",
    description:
      "Vind snel de juiste wijnselectie en vergelijk prijzen bij Nederlandse wijnwinkels.",
    url: `${SITE_URL}/wijngids`,
    type: "website",
  },
};

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function WijngidsHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Wijngids",
            numberOfItems: COLLECTION_GUIDES.length,
            itemListElement: COLLECTION_GUIDES.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/wijngids/${c.slug}`,
              name: c.name,
            })),
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
            Wijngids
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Vind snel de juiste wijn
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">
            Geen idee waar te beginnen? Kies een selectie: de best beoordeelde
            wijnen, een specifiek wijntype, een budget of de scherpste
            aanbiedingen. Alles met de beste prijs bij Nederlandse wijnwinkels.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COLLECTION_GUIDES.map((c) => (
            <Link
              key={c.slug}
              href={`/wijngids/${c.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-burgundy/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-heading text-xl font-semibold text-foreground group-hover:text-burgundy transition-colors">
                  {c.name}
                </h2>
                <ArrowRight className="h-5 w-5 mt-1 text-text-light group-hover:text-burgundy group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
              <p className="mt-2 text-sm text-text-light leading-relaxed">{c.intro}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
