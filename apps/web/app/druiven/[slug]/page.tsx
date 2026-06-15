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
    AND: [
      // Match the grape field as well as the name: a lot of single-varietal
      // wines (Argentinian Malbec, South-African Chenin) carry the grape in the
      // name but not the structured field, so this keeps the pages well filled.
      {
        OR: guide.match.flatMap((g) => [
          { grape: { contains: g, mode: "insensitive" as const } },
          { name: { contains: g, mode: "insensitive" as const } },
        ]),
      },
      // A varietal page should show the grape as its own wine, not as a minor
      // component of a sparkling blend (e.g. Chardonnay in Champagne) or a
      // dessert wine. Keep untyped wines (wineType null) so we don't lose the
      // large pool of wines without a structured type.
      {
        OR: [
          { wineType: null },
          { wineType: { notIn: ["sparkling", "dessert"] } },
        ],
      },
    ],
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
