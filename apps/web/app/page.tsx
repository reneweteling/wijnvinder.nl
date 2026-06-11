import { Hero } from "@/components/landing/hero";
import { FeaturedWines } from "@/components/landing/featured-wines";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { db } from "@/lib/db/client";

export const revalidate = 3600;

export default async function Home() {
  const [shopCount, wineCount] = await Promise.all([
    db.shop.count({ where: { enabled: true } }),
    db.canonicalWine.count(),
  ]);

  return (
    <main>
      <Hero shopCount={shopCount} wineCount={wineCount} />
      <FeaturedWines wineCount={wineCount} />
      <HowItWorks shopCount={shopCount} />
      <FeaturesSection shopCount={shopCount} />
      <CtaSection shopCount={shopCount} />
    </main>
  );
}
