import { notFound } from "next/navigation";
import { getGrapeGuide, GRAPE_GUIDES } from "@/lib/wine-guides";
import { fetchGuideWines } from "@/lib/guide-wines";
import { GuideLayout } from "@/components/wines/guide-layout";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGrapeGuide(slug);
  if (!guide) return { title: "Niet gevonden | WijnVinder" };

  const title = `${guide.h1} | WijnVinder`;
  return {
    title,
    description: guide.intro,
    alternates: { canonical: `/druiven/${slug}` },
    openGraph: {
      title,
      description: guide.intro,
      url: `${SITE_URL}/druiven/${slug}`,
      type: "article",
    },
  };
}

export default async function DruifPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getGrapeGuide(slug);
  if (!guide) notFound();

  const wines = await fetchGuideWines({
    OR: guide.match.map((g) => ({ grape: { contains: g, mode: "insensitive" as const } })),
  });

  const related = GRAPE_GUIDES.filter((g) => g.slug !== slug)
    .slice(0, 6)
    .map((g) => ({ href: `/druiven/${g.slug}`, label: g.name }));

  return (
    <GuideLayout
      h1={guide.h1}
      advice={guide.advice}
      faqQuestion={guide.faqQuestion}
      winesHeading={`Beste ${guide.name}-wijnen`}
      wines={wines}
      hub={{ href: "/druiven", label: "Alle druiven", name: "Druiven" }}
      current={guide.name}
      related={related}
      relatedHeading="Andere druiven"
    />
  );
}
