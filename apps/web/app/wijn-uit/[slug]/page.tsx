import { notFound } from "next/navigation";
import { getCountryGuide, COUNTRY_GUIDES } from "@/lib/wine-guides";
import { fetchGuideWines } from "@/lib/guide-wines";
import { GuideLayout } from "@/components/wines/guide-layout";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCountryGuide(slug);
  if (!guide) return { title: "Niet gevonden | WijnVinder" };

  const title = `${guide.h1} | WijnVinder`;
  return {
    title,
    description: guide.intro,
    alternates: { canonical: `/wijn-uit/${slug}` },
    openGraph: {
      title,
      description: guide.intro,
      url: `${SITE_URL}/wijn-uit/${slug}`,
      type: "article",
    },
  };
}

export default async function WijnUitPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getCountryGuide(slug);
  if (!guide) notFound();

  const wines = await fetchGuideWines({
    country: { in: guide.countries, mode: "insensitive" },
  });

  const related = COUNTRY_GUIDES.filter((c) => c.slug !== slug)
    .slice(0, 6)
    .map((c) => ({ href: `/wijn-uit/${c.slug}`, label: `Wijn uit ${c.name}` }));

  return (
    <GuideLayout
      h1={guide.h1}
      advice={guide.advice}
      faqQuestion={guide.faqQuestion}
      winesHeading={`Beste wijnen uit ${guide.name}`}
      wines={wines}
      hub={{ href: "/wijn-uit", label: "Alle landen", name: "Wijn per land" }}
      current={guide.name}
      related={related}
      relatedHeading="Andere landen"
    />
  );
}
