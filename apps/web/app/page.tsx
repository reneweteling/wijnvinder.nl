import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesSection } from "@/components/landing/features-section";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
    </main>
  );
}
