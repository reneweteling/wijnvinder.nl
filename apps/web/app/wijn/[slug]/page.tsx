import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db/client";
import { WineDetailHeader } from "@/components/wines/wine-detail-header";
import { PriceComparison } from "@/components/wines/price-comparison";
import { PriceHistoryChart } from "@/components/wines/price-history-chart";
import { MatchBreakdown } from "@/components/wines/match-breakdown";
import { WineCard } from "@/components/wines/wine-card";
import { pickPromotedListing } from "@/lib/listings";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

const PRICE_HISTORY_DAYS = 90
const PRICE_HISTORY_MAX_POINTS = 30

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Escape </script> sequences so JSON-LD blobs are safe inside <script> tags. */
function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/**
 * Fetch the wine for a given slug.
 *
 * Metadata query: only available listings (needed for canonical price in <head>).
 * Page query (fetchWineForPage): all listings including unavailable, because the
 * price-comparison table intentionally shows crossed-out unavailable entries.
 *
 * React.cache deduplicates the metadata fetch within a single render pass.
 */
const fetchWineForMetadata = cache(async (slug: string) => {
  return db.canonicalWine.findUnique({
    where: { slug },
    include: {
      producer: true,
      listings: { where: { available: true, shop: { enabled: true } }, orderBy: { price: "asc" }, take: 1 },
    },
  });
});

const fetchWineForPage = cache(async (slug: string) => {
  return db.canonicalWine.findUnique({
    where: { slug },
    include: {
      producer: true,
      // Include all listings (available and unavailable) from active shops — the
      // price-comparison table shows unavailable entries with a strikethrough price,
      // so we need them. Disabled shops are excluded entirely. Ordered by price for
      // the comparison table; the promoted shop is picked separately via priority.
      listings: {
        where: { shop: { enabled: true } },
        orderBy: { price: "asc" },
        include: { shop: { select: { slug: true, name: true, priority: true } } },
      },
    },
  });
});

/** Truncate description at the last space before maxLen, append "..." if cut. */
function truncateDescription(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const cut = text.lastIndexOf(" ", maxLen - 3);
  const boundary = cut > 0 ? cut : maxLen - 3;
  return text.slice(0, boundary) + "...";
}

/**
 * Build a display name for the wine that avoids doubling the producer name.
 * wine.name often already starts with the producer name ("Taittinger Brut..."),
 * so we only prepend producer when it isn't already there.
 */
function buildWineName(producerName: string | null | undefined, wineName: string, vintage: number | string | null | undefined): string {
  const parts: string[] = [];
  if (producerName && !wineName.toLowerCase().startsWith(producerName.toLowerCase())) {
    parts.push(producerName);
  }
  parts.push(wineName);
  if (vintage != null) parts.push(String(vintage));
  return parts.join(" ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const wine = await fetchWineForMetadata(slug);

  if (!wine) {
    return { title: "Wijn niet gevonden | WijnVinder" };
  }

  const displayName = buildWineName(wine.producer?.name, wine.name, wine.vintage);
  const title = `${displayName} | WijnVinder`;

  const bestPrice = wine.listings[0]?.price ?? null;

  const rawDescription = wine.description
    ? `Vanaf €${bestPrice != null ? `${bestPrice.toFixed(2)} - ` : ""}${wine.description}`
    : bestPrice != null
      ? `Vanaf €${bestPrice.toFixed(2)} - Vergelijk prijzen voor ${wine.name} bij Nederlandse wijnwinkels.`
      : `Bekijk prijzen en details van ${wine.name} bij Nederlandse wijnwinkels.`;

  const description = truncateDescription(rawDescription, 157);

  const canonicalUrl = `${SITE_URL}/wijn/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      ...(wine.imageUrl ? { images: [{ url: wine.imageUrl }] } : {}),
    },
  };
}

export default async function WijnDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const wine = await fetchWineForPage(slug);

  if (!wine) {
    notFound();
  }

  // The promoted listing (highest shop priority, then lowest price) is the shop we
  // actively push: header CTA, price shown on cards, redirect target.
  const availableListings = wine.listings.filter((l) => l.available);
  const promoted = pickPromotedListing(availableListings);

  const bestPrice = promoted?.price ?? null;
  const originalPrice = promoted?.originalPrice ?? null;
  const bestShopName = promoted?.shop?.name ?? null;
  const bestListingId = promoted?.id ?? null;

  // Price range across available listings (independent of promotion order) for JSON-LD.
  const availablePrices = availableListings.map((l) => l.price);
  const lowPrice = availablePrices.length ? Math.min(...availablePrices) : null;
  const highPrice = availablePrices.length ? Math.max(...availablePrices) : null;

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - PRICE_HISTORY_DAYS * 24 * 60 * 60 * 1000);

  // Build the OR conditions for similar wines — skip the query entirely if both are absent
  const similarOrConditions = [
    ...(wine.grape ? [{ grape: wine.grape }] : []),
    ...(wine.country ? [{ country: wine.country }] : []),
  ];

  // Run all secondary queries in parallel
  const [rawHistory, relatedWines, similarWinesCandidates] = await Promise.all([
    // Price history for the promoted listing (last 90 days, max 30 points)
    promoted
      ? db.priceHistory.findMany({
          where: {
            listingId: promoted.id,
            recordedAt: { gte: ninetyDaysAgo },
          },
          orderBy: { recordedAt: "asc" },
          take: PRICE_HISTORY_MAX_POINTS,
        })
      : Promise.resolve([]),

    // Other wines from the same producer
    wine.producerId
      ? db.canonicalWine.findMany({
          where: {
            producerId: wine.producerId,
            id: { not: wine.id },
          },
          include: { listings: { where: { available: true, shop: { enabled: true } }, include: { shop: { select: { priority: true } } } } },
          take: 6,
        })
      : Promise.resolve([]),

    // Similar wines: same wineType + (same grape OR same country)
    // Skip the query when neither grape nor country is available to avoid an empty OR array
    wine.wineType && similarOrConditions.length > 0
      ? db.canonicalWine.findMany({
          where: {
            id: { not: wine.id },
            wineType: wine.wineType,
            listings: { some: { available: true, shop: { enabled: true } } },
            NOT: { name: { contains: "pakket", mode: "insensitive" } },
            OR: similarOrConditions,
          },
          include: {
            producer: { select: { name: true } },
            listings: { where: { available: true, shop: { enabled: true } }, include: { shop: { select: { priority: true } } } },
          },
          orderBy: [{ vivinoScore: "desc" }],
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  // Determine whether price dropped between the two most recent history points
  // rawHistory is ordered asc, so the last point is the most recent and the
  // second-to-last is the previous recorded price.
  const priceDrop =
    rawHistory.length >= 2 &&
    rawHistory[rawHistory.length - 1].price < rawHistory[rawHistory.length - 2].price;

  // Filter to comparable price range (0.6x–1.6x current best price) then cap at 4
  const similarWines = bestPrice
    ? similarWinesCandidates
        .filter((w) => {
          const p = pickPromotedListing(w.listings)?.price;
          if (p == null) return false;
          return p >= bestPrice * 0.6 && p <= bestPrice * 1.6;
        })
        .slice(0, 4)
    : similarWinesCandidates.slice(0, 4);

  const productName = buildWineName(wine.producer?.name, wine.name, wine.vintage);

  // Google requires a Product to specify at least one of offers / review /
  // aggregateRating. Only emit the Product schema when we actually have an
  // available offer or a rating; otherwise it would be an invalid rich result.
  const hasOffers = availableListings.length > 0;
  const hasRating = wine.vivinoScore != null;
  const showProductJsonLd = hasOffers || hasRating;

  return (
    <div className="min-h-screen bg-background">
      {showProductJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productName,
            "description": wine.description || `${wine.name} - vergelijk prijzen bij Nederlandse wijnwinkels`,
            ...(wine.imageUrl ? { "image": wine.imageUrl } : {}),
            ...(wine.producer?.name ? { "brand": { "@type": "Brand", "name": wine.producer.name } } : {}),
            ...(hasRating ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": wine.vivinoScore,
                "bestRating": 5,
                "worstRating": 1,
                ...(wine.vivinoScoreCount ? { "ratingCount": wine.vivinoScoreCount } : {}),
              }
            } : {}),
            ...(hasOffers ? {
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "EUR",
                "lowPrice": lowPrice,
                "highPrice": highPrice,
                "offerCount": availableListings.length,
                "offers": availableListings.map(l => ({
                  "@type": "Offer",
                  "url": l.url,
                  "price": l.price,
                  "priceCurrency": "EUR",
                  "seller": { "@type": "Organization", "name": l.shop.name },
                  "availability": "https://schema.org/InStock",
                })),
              }
            } : {}),
          }) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
            { "@type": "ListItem", "position": 2, "name": "Wijnen", "item": `${SITE_URL}/wijnen` },
            { "@type": "ListItem", "position": 3, "name": buildWineName(wine.producer?.name, wine.name, null) },
          ]
        }) }}
      />
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          href="/wijnen"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar alle wijnen
        </Link>
      </div>

      {/* Wine hero header */}
      <WineDetailHeader
        wine={{
          id: wine.id,
          name: wine.name,
          producer: wine.producer?.name,
          grape: wine.grape,
          grapes: wine.grapes,
          country: wine.country,
          region: wine.region,
          wineType: wine.wineType,
          vintage: wine.vintage,
          vivinoScore: wine.vivinoScore,
          vivinoScoreCount: wine.vivinoScoreCount,
          vivinoUrl: wine.vivinoUrl,
          imageUrl: wine.imageUrl,
          description: wine.description,
        }}
        bestPrice={bestPrice}
        originalPrice={originalPrice}
        bestShopName={bestShopName}
        bestListingId={bestListingId}
        producerSlug={wine.producer?.slug}
        priceDrop={priceDrop}
      />

      {/* Price comparison + match breakdown */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price comparison - takes 2 columns */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
              Prijsvergelijking
            </h2>

            <PriceComparison
              listings={wine.listings.map((l) => ({
                id: l.id,
                shopSlug: l.shop.slug,
                shopName: l.shop.name,
                price: l.price,
                originalPrice: l.originalPrice,
                url: l.url,
                available: l.available,
                rating: l.rating,
              }))}
            />

            {wine.listings.length === 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-text-light">
                  Er zijn momenteel geen winkelvermeldingen beschikbaar voor deze wijn.
                </p>
              </div>
            )}

            {rawHistory.length >= 2 && bestPrice != null && (
              <div className="mt-6">
                <PriceHistoryChart
                  points={rawHistory.map((p) => ({
                    price: p.price,
                    recordedAt: p.recordedAt,
                  }))}
                  currentPrice={bestPrice}
                />
              </div>
            )}
          </div>

          {/* Match breakdown sidebar */}
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
              Smaakprofiel
            </h2>
            <MatchBreakdown
              wine={{
                id: wine.id,
                grape: wine.grape,
                grapes: wine.grapes,
                country: wine.country,
                wineType: wine.wineType,
                vivinoScore: wine.vivinoScore,
                bestPrice: bestPrice,
              }}
            />
          </div>
        </div>
      </div>

      {/* Similar wines */}
      {similarWines.length >= 2 && (
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
            Vergelijkbare wijnen
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similarWines.map((similar) => {
              const promo = pickPromotedListing(similar.listings);
              return (
                <WineCard
                  key={similar.id}
                  wine={{
                    id: similar.id,
                    slug: similar.slug,
                    name: similar.name,
                    producer: similar.producer?.name ?? null,
                    grape: similar.grape,
                    country: similar.country,
                    region: similar.region,
                    wineType: similar.wineType,
                    vivinoScore: similar.vivinoScore,
                    imageUrl: similar.imageUrl,
                    bestPrice: promo?.price ?? null,
                    originalPrice: promo?.originalPrice ?? null,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Related wines from same producer */}
      {relatedWines.length > 0 && wine.producer?.name && (
        <div className="max-w-5xl mx-auto px-4 pb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Meer van {wine.producer?.name}
            </h2>
            <Link
              href={`/producent/${wine.producer?.slug}`}
              className="text-sm text-burgundy hover:underline"
            >
              Alle wijnen →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedWines.map((related) => {
              const promo = pickPromotedListing(related.listings);
              return (
                <Link
                  key={related.id}
                  href={`/wijn/${related.slug}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
                >
                  {related.imageUrl && (
                    <Image
                      src={related.imageUrl}
                      alt={related.name}
                      width={48}
                      height={64}
                      className="object-contain rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{related.name}</p>
                    {related.vintage && (
                      <p className="text-xs text-text-light">{related.vintage}</p>
                    )}
                    {promo && (
                      <p className="text-sm font-semibold text-burgundy">
                        €{promo.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
