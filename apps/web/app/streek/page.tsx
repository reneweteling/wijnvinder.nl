import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { REGION_GUIDES } from "@/lib/wine-regions";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wijn per streek — ontdek de wijngebieden van Europa",
  description:
    "Van Bordeaux en Bourgogne tot Rioja, Toscane en de Douro: ontdek de bekendste wijnstreken, hun stijl en de beste flessen met de scherpste prijs.",
  alternates: { canonical: "/streek" },
  openGraph: {
    title: "Wijn per streek | WijnVinder",
    description:
      "Ontdek de bekendste wijnstreken van Europa, hun stijl en de beste flessen.",
    url: `${SITE_URL}/streek`,
    type: "website",
  },
};

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

// Preserve the order of first appearance in REGION_GUIDES.
function groupByCountry() {
  const groups: { country: string; regions: typeof REGION_GUIDES }[] = [];
  for (const r of REGION_GUIDES) {
    let g = groups.find((x) => x.country === r.country);
    if (!g) {
      g = { country: r.country, regions: [] };
      groups.push(g);
    }
    g.regions.push(r);
  }
  return groups;
}

export default function StreekHubPage() {
  const groups = groupByCountry();

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Wijn per streek",
            numberOfItems: REGION_GUIDES.length,
            itemListElement: REGION_GUIDES.map((r, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/streek/${r.slug}`,
              name: r.name,
            })),
          }),
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-12 max-w-2xl">
          <p className="text-gold font-medium text-sm uppercase tracking-[0.2em] mb-2">
            Wijn per streek
          </p>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Ontdek de wijnstreken van Europa
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">
            Elke streek heeft zijn eigen druiven, stijl en karakter. Kies een
            gebied en ontdek waar het voor staat, met de best beoordeelde flessen
            en de scherpste prijs bij Nederlandse wijnwinkels.
          </p>
        </header>

        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.country}>
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="h-5 w-5 text-burgundy" />
                <h2 className="font-heading text-2xl font-semibold text-foreground">
                  {group.country}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {group.regions.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/streek/${r.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-burgundy/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-xl font-semibold text-foreground group-hover:text-burgundy transition-colors">
                        {r.name}
                      </h3>
                      <ArrowRight className="h-5 w-5 mt-1 text-text-light group-hover:text-burgundy group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                    <p className="mt-2 text-sm text-text-light leading-relaxed">
                      {r.intro}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
