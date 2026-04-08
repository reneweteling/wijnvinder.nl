import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db/client";
import { WineDetailHeader } from "@/components/wines/wine-detail-header";
import { PriceComparison } from "@/components/wines/price-comparison";
import { MatchBreakdown } from "@/components/wines/match-breakdown";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const wine = await db.canonicalWine.findUnique({
    where: { slug },
    include: {
      producer: true,
      listings: { where: { available: true }, orderBy: { price: "asc" }, take: 1 },
    },
  });

  if (!wine) {
    return { title: "Wijn niet gevonden | WijnVinder" };
  }

  const titleParts = [wine.producer?.name, wine.name, wine.vintage].filter(Boolean);
  const title = `${titleParts.join(" ")} | WijnVinder`;

  const bestPrice = wine.listings[0]?.price ?? null;
  const baseDescription = wine.description
    ? wine.description.slice(0, 120)
    : `Bekijk prijzen en details van ${wine.name} bij Nederlandse wijnwinkels.`;
  const description = bestPrice
    ? `Vanaf €${bestPrice.toFixed(2)} - Vergelijk prijzen voor ${wine.name} bij Nederlandse wijnwinkels. ${baseDescription}`.slice(0, 160)
    : baseDescription;

  const canonicalUrl = `https://wijnvinder.nl/wijn/${slug}`;

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

  const wine = await db.canonicalWine.findUnique({
    where: { slug },
    include: {
      producer: true,
      listings: {
        orderBy: { price: "asc" },
        include: { shop: { select: { slug: true, name: true } } },
      },
    },
  });

  if (!wine) {
    notFound();
  }

  // Compute best price from available listings
  const availableListings = wine.listings.filter((l) => l.available);
  const cheapest = availableListings[0] ?? null;

  const bestPrice = cheapest?.price ?? null;
  const originalPrice = cheapest?.originalPrice ?? null;
  const bestShopName = cheapest?.shop?.name ?? null;
  const bestShopUrl = cheapest?.url ?? null;

  // Find other wines from the same producer
  const relatedWines = wine.producerId
    ? await db.canonicalWine.findMany({
        where: {
          producerId: wine.producerId,
          id: { not: wine.id },
        },
        include: { listings: { where: { available: true }, orderBy: { price: "asc" }, take: 1 } },
        take: 6,
      })
    : [];

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": [wine.producer?.name, wine.name, wine.vintage].filter(Boolean).join(" "),
          "description": wine.description || `${wine.name} - vergelijk prijzen bij Nederlandse wijnwinkels`,
          ...(wine.imageUrl ? { "image": wine.imageUrl } : {}),
          ...(wine.producer?.name ? { "brand": { "@type": "Brand", "name": wine.producer.name } } : {}),
          ...(wine.vivinoScore ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": wine.vivinoScore,
              "bestRating": 5,
              "worstRating": 1,
              ...(wine.vivinoScoreCount ? { "ratingCount": wine.vivinoScoreCount } : {}),
            }
          } : {}),
          ...(availableListings.length > 0 ? {
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "EUR",
              "lowPrice": availableListings[0].price,
              "highPrice": availableListings[availableListings.length - 1].price,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wijnvinder.nl" },
            { "@type": "ListItem", "position": 2, "name": "Wijnen", "item": "https://wijnvinder.nl/aanbevelingen" },
            { "@type": "ListItem", "position": 3, "name": [wine.producer?.name, wine.name].filter(Boolean).join(" ") },
          ]
        }) }}
      />
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          href="/aanbevelingen"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar aanbevelingen
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
        bestShopUrl={bestShopUrl}
        producerSlug={wine.producer?.slug}
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
            {relatedWines.map((related) => (
              <Link
                key={related.id}
                href={`/wijn/${related.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:shadow-sm transition-shadow"
              >
                {related.imageUrl && (
                  <img
                    src={related.imageUrl}
                    alt={related.name}
                    className="w-12 h-16 object-contain rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{related.name}</p>
                  {related.vintage && (
                    <p className="text-xs text-text-light">{related.vintage}</p>
                  )}
                  {related.listings[0] && (
                    <p className="text-sm font-semibold text-burgundy">
                      €{related.listings[0].price.toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
