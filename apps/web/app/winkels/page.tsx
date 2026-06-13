import Image from "next/image";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";
import { timeAgo } from "@/lib/time";
import { ExternalLink, Store, Wine } from "lucide-react";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import type { Metadata } from "next";

// Rendered at runtime so the production build never needs a database.
// The query result is cached for a day via unstable_cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wijnwinkels die we vergelijken",
  description:
    "Bekijk alle Nederlandse wijnwinkels waarvan WijnVinder de prijzen vergelijkt, met dagelijks bijgewerkte aanbiedingen en het aantal beschikbare wijnen per winkel.",
  alternates: { canonical: "/winkels" },
  openGraph: {
    title: "Wijnwinkels die we vergelijken | WijnVinder",
    description:
      "Alle Nederlandse wijnwinkels waarvan WijnVinder de prijzen vergelijkt.",
    url: `${SITE_URL}/winkels`,
    siteName: "WijnVinder",
    locale: "nl_NL",
    type: "website",
  },
};

const getShops = unstable_cache(
  async () =>
    db.shop.findMany({
      where: { enabled: true },
      include: {
        scrapeJobs: {
          where: { status: "completed" },
          take: 1,
          orderBy: { completedAt: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ["winkels-shops"],
  { revalidate: 86400 },
);

export default async function WinkelsPage() {
  const shops = await getShops();

  const shopsJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Nederlandse wijnwinkels op WijnVinder",
    numberOfItems: shops.length,
    itemListElement: shops.map((shop, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Store",
        name: shop.name,
        url: shop.baseUrl ?? undefined,
        ...(shop.logoUrl ? { image: shop.logoUrl } : {}),
        ...(shop.description ? { description: shop.description } : {}),
      },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: shopsJsonLd }}
      />
      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-burgundy to-burgundy/90 pt-28 pb-16 text-center text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-wine.jpg')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
          <span className="inline-block text-gold font-medium text-sm uppercase tracking-[0.2em] mb-4 border border-gold/30 rounded-full px-5 py-1.5">
            {shops.length} winkels
          </span>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl leading-tight mb-4">
            Onze <span className="text-gold">Winkels</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Wij vergelijken prijzen bij {shops.length} Nederlandse wijnwinkels
            zodat jij altijd de beste deal vindt.
          </p>
        </div>
      </section>

      {/* Shop grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => {
            const lastScrape = shop.scrapeJobs[0] ?? null;

            return (
              <div
                key={shop.id}
                className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* Shop header */}
                <div className="flex items-start gap-3">
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl}
                      alt={`${shop.name} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg object-contain bg-white border border-border p-1 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                      <Store className="w-6 h-6 text-burgundy" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="font-heading text-lg font-semibold text-foreground truncate">
                      {shop.name}
                    </h2>
                    <p className="text-sm text-text-light truncate">
                      {shop.baseUrl?.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {shop.description && (
                  <p className="text-sm text-text-light leading-relaxed line-clamp-3">
                    {shop.description}
                  </p>
                )}

                {/* Scrape stats */}
                <div className="flex items-center gap-4 text-sm text-text-light mt-auto pt-3 border-t border-border">
                  {lastScrape ? (
                    <>
                      <span className="flex items-center gap-1.5">
                        <Wine className="w-4 h-4 text-burgundy" />
                        {lastScrape.listingsFound?.toLocaleString("nl-NL") ?? 0} wijnen
                      </span>
                      <span className="text-border">|</span>
                      <span>
                        {lastScrape.completedAt
                          ? timeAgo(lastScrape.completedAt)
                          : "Nog niet gescraped"}
                      </span>
                    </>
                  ) : (
                    <span>Nog niet gescraped</span>
                  )}
                </div>

                {/* Link to shop */}
                <a
                  href={shop.baseUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-burgundy/10 text-burgundy font-medium text-sm py-2.5 px-4 hover:bg-burgundy hover:text-white transition-colors"
                >
                  Bekijk winkel
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {shops.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Store className="w-12 h-12 text-text-light mx-auto mb-4" />
            <p className="text-text-light text-lg">
              Er zijn momenteel geen winkels beschikbaar.
            </p>
          </div>
        )}
      </section>

      {/* CTA for shops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
            Ook uw wijnwinkel op WijnVinder.nl?
          </h2>
          <p className="text-text-light text-sm mb-4 max-w-lg mx-auto">
            Bent u een wijnwinkel en wilt u ook door ons geïndexeerd worden?
            Neem contact met ons op en we bespreken de mogelijkheden.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-lg bg-burgundy text-white font-medium text-sm py-2.5 px-6 hover:bg-burgundy/90 transition-colors"
          >
            Neem contact op
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
