import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/admin";
import { ShopsFilter, type ShopItem } from "./shops-filter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Winkels — Beheer — WijnVinder",
};

export default async function WinkelsPage() {
  await requireAdmin();

  const raw = await db.shop.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      baseUrl: true,
      logoUrl: true,
      enabled: true,
      priority: true,
      referralEnabled: true,
      referralParam: true,
      affiliateLinkTemplate: true,
      _count: {
        select: { listings: true },
      },
    },
  });

  const shops: ShopItem[] = raw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    baseUrl: s.baseUrl,
    logoUrl: s.logoUrl,
    enabled: s.enabled,
    priority: s.priority,
    referralEnabled: s.referralEnabled,
    referralParam: s.referralParam,
    affiliateLinkTemplate: s.affiliateLinkTemplate,
    listingCount: s._count.listings,
  }));

  return (
    <div>
      <p className="text-text-light mb-8">
        {shops.length} winkel{shops.length !== 1 ? "s" : ""} gevonden.
      </p>
      <ShopsFilter shops={shops} />
    </div>
  );
}
