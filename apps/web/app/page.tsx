import { Hero } from "@/components/landing/hero";
import { FeaturedWines } from "@/components/landing/featured-wines";
import { SommelierPromo } from "@/components/landing/sommelier-promo";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db/client";

// Rendered at runtime so the production build never needs a database.
// The query result is cached for an hour via unstable_cache.
export const dynamic = "force-dynamic";

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
      <Hero shopCount={shopCount} wineCount={wineCount} />
      <FeaturedWines wineCount={wineCount} />
      <SommelierPromo />
      <HowItWorks shopCount={shopCount} />
      <FeaturesSection shopCount={shopCount} />
      <CtaSection shopCount={shopCount} />
    </main>
  );
}
