import { notFound } from "next/navigation";
import { getRegionGuide, REGION_GUIDES } from "@/lib/wine-regions";
import { fetchGuideWines } from "@/lib/guide-wines";
import { GuideLayout } from "@/components/wines/guide-layout";
import { MiniMap } from "@/components/wines/mini-map";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getRegionGuide(slug);
  if (!guide) return { title: "Niet gevonden | WijnVinder" };

  const title = `${guide.h1} | WijnVinder`;
  return {
    title,
    description: guide.intro,
    alternates: { canonical: `/streek/${slug}` },
    openGraph: {
      title,
      description: guide.intro,
      url: `${SITE_URL}/streek/${slug}`,
      type: "article",
    },
  };
}

export default async function StreekPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getRegionGuide(slug);
  if (!guide) notFound();

  const wines = await fetchGuideWines({
    OR: guide.match.flatMap((m) => [
      { region: { contains: m, mode: "insensitive" as const } },
      { name: { contains: m, mode: "insensitive" as const } },
    ]),
  });

  // Show regions from the same country first, then a few others.
  const sameCountry = REGION_GUIDES.filter(
    (r) => r.slug !== slug && r.country === guide.country,
  );
  const otherCountry = REGION_GUIDES.filter(
    (r) => r.slug !== slug && r.country !== guide.country,
  );
  const related = [...sameCountry, ...otherCountry].slice(0, 8).map((r) => ({
    href: `/streek/${r.slug}`,
    label: r.name,
  }));

  const [lat, lon, span] = guide.map;

  return (
    <GuideLayout
      h1={guide.h1}
      advice={guide.advice}
      faqQuestion={guide.faqQuestion}
      winesHeading={`Beste wijnen uit ${guide.name}`}
      wines={wines}
      hub={{ href: "/streek", label: "Alle streken", name: "Wijn per streek" }}
      current={guide.name}
      related={related}
      relatedHeading="Andere streken"
      map={<MiniMap lat={lat} lon={lon} span={span} label={guide.name} />}
    />
  );
}
