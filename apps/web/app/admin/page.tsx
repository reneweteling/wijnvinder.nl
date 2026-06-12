import Link from "next/link";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beheer — WijnVinder",
};

async function fetchCounts() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return Promise.all([
    db.canonicalWine.count(),
    db.shopListing.count(),
    db.shop.count(),
    db.shop.count({ where: { enabled: true } }),
    db.user.count(),
    db.scrapeJob.count({ where: { status: { in: ["pending", "running"] } } }),
    db.outboundClick.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);
}

export default async function AdminDashboardPage() {
  const [
    wijnCount,
    listingCount,
    shopCount,
    shopEnabledCount,
    gebruikerCount,
    openJobCount,
    clicksWeek,
  ] = await fetchCounts();

  return (
    <div>
      <p className="text-text-light mb-8">Overzicht van de huidige stand van zaken.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CountCard
          label="Wijnen"
          value={wijnCount}
          href="/admin/wijnen"
        />
        <CountCard
          label="Listings"
          value={listingCount}
        />
        <CountCard
          label="Winkels"
          value={shopCount}
          sub={`${shopEnabledCount} actief`}
          href="/admin/winkels"
        />
        <CountCard
          label="Gebruikers"
          value={gebruikerCount}
          href="/admin/gebruikers"
        />
        <CountCard
          label="Open scrape jobs"
          value={openJobCount}
          href="/admin/jobs"
        />
        <CountCard
          label="Kliks laatste 7 dagen"
          value={clicksWeek}
          href="/stats"
        />
      </div>
    </div>
  );
}

function CountCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-xl border border-border bg-card px-6 py-5 h-full">
      <p className="text-sm text-text-light mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-burgundy">
        {value.toLocaleString("nl-NL")}
      </p>
      {sub && <p className="text-xs text-text-light mt-1">{sub}</p>}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}
