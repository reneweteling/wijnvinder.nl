import { Hero } from "@/components/landing/hero";
import { FeaturedWines } from "@/components/landing/featured-wines";
import { SommelierPromo } from "@/components/landing/sommelier-promo";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

// Rendered at runtime so the production build never needs a database.
// The query result is cached for an hour via unstable_cache.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "WijnVinder — Wijnen vergelijken en persoonlijk wijnadvies",
  },
  description:
    "Vergelijk prijzen van duizenden wijnen bij Nederlandse wijnwinkels en laat AI-sommelier Maurice de perfecte wijn bij jouw gerecht of smaak kiezen. Gratis en zonder account.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "WijnVinder — Wijnen vergelijken en persoonlijk wijnadvies",
    description:
      "Vergelijk wijnprijzen bij Nederlandse wijnwinkels en krijg persoonlijk advies van AI-sommelier Maurice.",
    url: SITE_URL,
  },
};

/** Helpt zoekmachines en AI-engines de kernvragen over WijnVinder begrijpen (GEO). */
function faqJsonLd(wineCount: number, shopCount: number): string {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Wat is WijnVinder?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `WijnVinder is een Nederlandse wijnvergelijker die de prijzen van ruim ${wineCount.toLocaleString("nl-NL")} wijnen bij ${shopCount} Nederlandse wijnwinkels naast elkaar zet, zodat je altijd het beste aanbod vindt. Daarnaast geeft AI-sommelier Maurice persoonlijk wijnadvies.`,
        },
      },
      {
        "@type": "Question",
        name: "Wat doet AI-sommelier Maurice?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Maurice is de AI-sommelier van WijnVinder. Je vertelt wat je eet of welke smaak je zoekt, en Maurice kiest passende wijnen op basis van je smaakprofiel en de beschikbare wijnen.",
        },
      },
      {
        "@type": "Question",
        name: "Kost WijnVinder geld?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nee, WijnVinder is gratis te gebruiken. Je kunt zonder account wijnen vergelijken en Maurice om advies vragen.",
        },
      },
      {
        "@type": "Question",
        name: "Bij welke winkels vergelijkt WijnVinder de prijzen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `WijnVinder vergelijkt prijzen bij ${shopCount} Nederlandse wijnwinkels en werkt de prijzen dagelijks bij.`,
        },
      },
    ],
  };
  return JSON.stringify(faq).replace(/</g, "\\u003c");
}

const getHomeStats = unstable_cache(
  async () => {
    const [shopCount, wineCount] = await Promise.all([
      db.shop.count({ where: { enabled: true } }),
      db.canonicalWine.count(),
    ]);
    return { shopCount, wineCount };
  },
  ["home-stats"],
  { revalidate: 3600 },
);

export default async function Home() {
  const { shopCount, wineCount } = await getHomeStats();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd(wineCount, shopCount) }}
      />
      <Hero shopCount={shopCount} wineCount={wineCount} />
      <FeaturedWines wineCount={wineCount} />
      <SommelierPromo />
      <HowItWorks shopCount={shopCount} />
      <FeaturesSection shopCount={shopCount} />
      <CtaSection shopCount={shopCount} />
    </main>
  );
}
