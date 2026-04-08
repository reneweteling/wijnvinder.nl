import Link from "next/link";
import { ProfileWizard } from "@/components/profile/profile-wizard";
import { db } from "@/lib/db/client";

export const metadata = {
  title: "Maak je Smaakprofiel – WijnVinder",
  description:
    "Stel je smaakprofiel in en ontvang persoonlijke wijnaanbevelingen van Nederlandse wijnwinkels.",
};

export default async function ProfielPage() {
  const shopCount = await db.shop.count({ where: { enabled: true } });
  return (
    <main className="min-h-screen bg-background">
      {/* Hero banner */}
      <div className="bg-gradient-to-b from-primary-light to-background border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <span className="text-4xl mb-3 block">🍷</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Jouw Smaakprofiel
          </h1>
          <p className="mt-2 text-text-light text-lg max-w-xl mx-auto">
            Vertel ons wat jij lekker vindt en wij zoeken de beste wijnen voor
            jou bij{" "}
            <Link href="/winkels" className="text-burgundy underline underline-offset-2 hover:text-burgundy/80">
              {shopCount}+ Nederlandse wijnwinkels
            </Link>.
          </p>
        </div>
      </div>

      {/* Wizard */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ProfileWizard />
      </div>
    </main>
  );
}
