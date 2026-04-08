import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export default async function Home() {
  const shopCount = await db.shop.count({ where: { enabled: true } });

  return (
    <main>
      <Hero shopCount={shopCount} />
      <HowItWorks shopCount={shopCount} />
      <FeaturesSection shopCount={shopCount} />
      <CtaSection shopCount={shopCount} />
    </main>
  );
}
