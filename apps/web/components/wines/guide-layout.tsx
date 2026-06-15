import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { WineCard } from "@/components/wines/wine-card";
import { SITE_URL } from "@/lib/site";
import type { WineCardWine } from "@/lib/types";

function jsonLd(obj: object): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export type GuideLayoutProps = {
  h1: string;
  advice: string;
  faqQuestion: string;
  winesHeading: string;
  wines: WineCardWine[];
  /** Hub link shown as a back link and used in the breadcrumb. */
  hub: { href: string; label: string; name: string };
  /** Current page's breadcrumb name. */
  current: string;
  /** Related links shown as chips at the bottom. */
  related: { href: string; label: string }[];
  relatedHeading: string;
  /** Optional node (e.g. a map) shown under the header. */
  map?: ReactNode;
};

export function GuideLayout({
  h1,
  advice,
  faqQuestion,
  winesHeading,
  wines,
  hub,
  current,
  related,
  relatedHeading,
  map,
}: GuideLayoutProps) {
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
                name: faqQuestion,
                acceptedAnswer: { "@type": "Answer", text: advice },
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
              { "@type": "ListItem", position: 2, name: hub.name, item: `${SITE_URL}${hub.href}` },
              { "@type": "ListItem", position: 3, name: current },
            ],
          }),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 py-4">
        <Link
          href={hub.href}
          className="inline-flex items-center gap-1.5 text-sm text-text-light hover:text-burgundy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {hub.label}
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <header className="mb-8 max-w-3xl">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">
            {h1}
          </h1>
          <p className="mt-4 text-text-light leading-relaxed">{advice}</p>
          {map}
        </header>

        {wines.length > 0 ? (
          <section>
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
              {winesHeading}
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

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-2xl font-semibold text-foreground mb-5">
              {relatedHeading}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {related.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-burgundy hover:text-burgundy transition-colors"
                >
                  {r.label}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
