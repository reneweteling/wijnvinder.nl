import { notFound } from "next/navigation";
import { getCollectionGuide, COLLECTION_GUIDES } from "@/lib/wine-collections";
import { fetchCollectionWines } from "@/lib/guide-wines";
import { GuideLayout } from "@/components/wines/guide-layout";
import { SITE_URL } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCollectionGuide(slug);
  if (!guide) return { title: "Niet gevonden | WijnVinder" };

  const title = `${guide.h1} | WijnVinder`;
  return {
    title,
    description: guide.intro,
    alternates: { canonical: `/wijngids/${slug}` },
    openGraph: {
      title,
      description: guide.intro,
      url: `${SITE_URL}/wijngids/${slug}`,
      type: "website",
    },
  };
}

export default async function WijngidsPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getCollectionGuide(slug);
  if (!guide) notFound();

  const wines = await fetchCollectionWines(guide.filter, guide.sort);

  const related = COLLECTION_GUIDES.filter((c) => c.slug !== slug)
    .slice(0, 6)
    .map((c) => ({ href: `/wijngids/${c.slug}`, label: c.name }));

  return (
    <GuideLayout
      h1={guide.h1}
      advice={guide.advice}
      faqQuestion={guide.faqQuestion}
      winesHeading={guide.name}
      wines={wines}
      hub={{ href: "/wijngids", label: "Alle selecties", name: "Wijngids" }}
      current={guide.name}
      related={related}
      relatedHeading="Andere selecties"
    />
  );
}
