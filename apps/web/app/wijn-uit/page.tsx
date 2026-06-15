import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { COUNTRY_GUIDES } from "@/lib/wine-guides";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wijn per land — ontdek wijnlanden en hun stijlen",
  description:
    "Van Frankrijk tot Argentinië: ontdek per wijnland de regio's en stijlen, en vergelijk de best beoordeelde wijnen bij Nederlandse wijnwinkels.",
  alternates: { canonical: "/wijn-uit" },
  openGraph: {
    title: "Wijn per land — ontdek wijnlanden en hun stijlen | WijnVinder",
    description:
      "Ontdek per wijnland de regio's en stijlen en vergelijk de beste wijnen.",
    url: `${SITE_URL}/wijn-uit`,
    type: "website",
  },
};

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function WijnUitHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Wijn per land",
            numberOfItems: COUNTRY_GUIDES.length,
            itemListElement: COUNTRY_GUIDES.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/wijn-uit/${c.slug}`,
              name: `Wijn uit ${c.name}`,
            })),
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-10 max-w-2xl">
          <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
            Wijnlanden
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Wijn per land
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">
            Elk wijnland heeft zijn eigen druiven, regio's en stijl. Kies een
            land voor uitleg en de best beoordeelde wijnen, met de scherpste
            prijs bij Nederlandse wijnwinkels.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COUNTRY_GUIDES.map((c) => (
            <Link
              key={c.slug}
              href={`/wijn-uit/${c.slug}`}
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
