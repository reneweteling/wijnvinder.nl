import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { db } from "@/lib/db/client";
import { pickPromotedListing } from "@/lib/listings";
import { getPairing, FOOD_PAIRINGS } from "@/lib/food-pairings";
import { WineCard } from "@/components/wines/wine-card";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pairing = getPairing(slug);
  if (!pairing) return { title: "Niet gevonden | WijnVinder" };

  const title = `${pairing.question} | WijnVinder`;
  return {
    title,
    description: pairing.intro,
    alternates: { canonical: `/wijn-bij/${slug}` },
    openGraph: {
      title,
      description: pairing.intro,
      url: `${SITE_URL}/wijn-bij/${slug}`,
      type: "article",
    },
  };
}

async function findPairingWines(grapes: string[], wineTypes: string[]) {
  const or = [
    ...(wineTypes.length ? [{ wineType: { in: wineTypes } }] : []),
    ...grapes.map((g) => ({ grape: { contains: g, mode: "insensitive" as const } })),
  ];

  return db.canonicalWine.findMany({
    where: {
      listings: { some: { available: true, shop: { enabled: true } } },
      NOT: { name: { contains: "pakket", mode: "insensitive" } },
      OR: or,
    },
    include: {
      producer: { select: { name: true } },
      listings: {
        where: { available: true, shop: { enabled: true } },
        include: { shop: { select: { priority: true } } },
      },
    },
    orderBy: [{ vivinoScore: { sort: "desc", nulls: "last" } }, { name: "asc" }],
    take: 12,
  });
}

export default async function WijnBijPage({ params }: PageProps) {
  const { slug } = await params;
  const pairing = getPairing(slug);
  if (!pairing) notFound();

  const rows = await findPairingWines(pairing.grapes, pairing.wineTypes);

  const wines = rows.map((wine) => {
    const promo = pickPromotedListing(wine.listings);
    return {
      id: wine.id,
      slug: wine.slug,
      name: wine.name,
      producer: wine.producer?.name ?? null,
      grape: wine.grape,
      country: wine.country,
      region: wine.region,
      wineType: wine.wineType,
      vivinoScore: wine.vivinoScore,
      imageUrl: wine.imageUrl,
      bestPrice: promo?.price ?? null,
      originalPrice: promo?.originalPrice ?? null,
      shopCount: wine.listings.filter((l) => l.available).length,
    };
  });

  const related = FOOD_PAIRINGS.filter((p) => p.slug !== slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: pairing.question,
                acceptedAnswer: { "@type": "Answer", text: pairing.advice },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Wijn bij gerecht", item: `${SITE_URL}/wijn-bij` },
              { "@type": "ListItem", position: 3, name: pairing.label },
            ],
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          href="/wijn-bij"
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Alle gerechten
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <header className="mb-8 max-w-3xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {pairing.question}
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">{pairing.advice}</p>
        </header>

        {/* Maurice CTA */}
        <Link
          href={`/sommelier?vraag=${encodeURIComponent(`Welke wijn past bij ${pairing.label.toLowerCase()}?`)}`}
          className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-4 py-2 text-sm font-medium text-burgundy hover:bg-gold/20 transition-colors mb-10"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          Vraag AI-sommelier Maurice om persoonlijk advies
          <ArrowRight className="h-4 w-4" />
        </Link>

        {wines.length > 0 ? (
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
              Aanraders bij {pairing.label.toLowerCase()}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-text-light">
            Momenteel geen passende wijnen beschikbaar.{" "}
            <Link href="/wijnen" className="text-burgundy underline">
              Bekijk alle wijnen
            </Link>
            .
          </p>
        )}

        {/* Related pairings */}
        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
            Andere gerechten
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/wijn-bij/${p.slug}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-burgundy hover:text-burgundy transition-colors"
              >
                Wijn bij {p.label.toLowerCase()}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
