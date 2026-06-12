import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stats — WijnVinder",
};

// --- types ------------------------------------------------------------------

type ShopClickRow = {
  shopid: string;
  shopname: string;
  total: bigint;
  last30d: bigint;
  last7d: bigint;
};

type TopWineRow = {
  canonicalwineid: string;
  clicks: bigint;
};

type SourceRow = {
  source: string | null;
  count: bigint;
};

// --- data fetching ----------------------------------------------------------

async function fetchStats() {
  const now = new Date();
  const ago7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Single query: totals + per-shop counts using FILTER
  const shopClickRows = await db.$queryRaw<ShopClickRow[]>`
    SELECT
      s.id        AS shopid,
      s.name      AS shopname,
      COUNT(*)                                                          AS total,
      COUNT(*) FILTER (WHERE oc."createdAt" >= ${ago30})              AS last30d,
      COUNT(*) FILTER (WHERE oc."createdAt" >= ${ago7})               AS last7d
    FROM shop s
    LEFT JOIN outbound_click oc ON oc."shopId" = s.id
    GROUP BY s.id, s.name
    ORDER BY s.name ASC
  `;

  const totalClicks = shopClickRows.reduce(
    (sum, r) => sum + Number(r.total),
    0,
  );
  const clicks30d = shopClickRows.reduce(
    (sum, r) => sum + Number(r.last30d),
    0,
  );
  const clicks7d = shopClickRows.reduce(
    (sum, r) => sum + Number(r.last7d),
    0,
  );

  const shopStats = shopClickRows.map((r) => ({
    shop: { id: r.shopid, name: r.shopname },
    total: Number(r.total),
    last30d: Number(r.last30d),
    last7d: Number(r.last7d),
  }));

  // Top 10 wines by clicks in last 30 days (groupBy in DB)
  const topWineClickRows = await db.$queryRaw<TopWineRow[]>`
    SELECT "canonicalWineId" AS canonicalwineid, COUNT(*) AS clicks
    FROM outbound_click
    WHERE "createdAt" >= ${ago30}
      AND "canonicalWineId" IS NOT NULL
    GROUP BY "canonicalWineId"
    ORDER BY clicks DESC
    LIMIT 10
  `;

  const topWineIds = topWineClickRows.map((r) => r.canonicalwineid);
  const topWines = topWineIds.length
    ? await db.canonicalWine.findMany({
        where: { id: { in: topWineIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const topWineRows = topWineClickRows.map((r) => ({
    wine: topWines.find((w) => w.id === r.canonicalwineid)!,
    clicks: Number(r.clicks),
  }));

  // Source distribution (groupBy in DB)
  const sourceClickRows = await db.$queryRaw<SourceRow[]>`
    SELECT source, COUNT(*) AS count
    FROM outbound_click
    GROUP BY source
    ORDER BY count DESC
  `;

  const sourceRows: [string, number][] = sourceClickRows.map((r) => [
    r.source ?? "(onbekend)",
    Number(r.count),
  ]);

  return { totalClicks, clicks7d, clicks30d, shopStats, topWineRows, sourceRows };
}

// --- page -------------------------------------------------------------------

export default async function StatsPage() {
  await requireAdmin();

  const { totalClicks, clicks7d, clicks30d, shopStats, topWineRows, sourceRows } =
    await fetchStats();

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Statistieken
        </h1>
        <p className="text-text-light mb-10">
          Doorkliks naar winkels, voor intern gebruik en affiliate-rapportage.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <StatCard label="Totaal kliks" value={totalClicks} />
          <StatCard label="Kliks laatste 7 dagen" value={clicks7d} />
          <StatCard label="Kliks laatste 30 dagen" value={clicks30d} />
        </div>

        {/* Kliks per winkel */}
        <section className="mb-12">
          <h2 className="font-heading text-xl font-semibold text-burgundy mb-4">
            Kliks per winkel
          </h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-light">
                  <th className="text-left px-5 py-3 font-medium">Winkel</th>
                  <th className="text-right px-5 py-3 font-medium">Totaal</th>
                  <th className="text-right px-5 py-3 font-medium">30 dagen</th>
                  <th className="text-right px-5 py-3 font-medium">7 dagen</th>
                </tr>
              </thead>
              <tbody>
                {shopStats.map(({ shop, total, last30d, last7d }) => (
                  <tr
                    key={shop.id}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {shop.name}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{total}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{last30d}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{last7d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Top 10 wijnen */}
        <section className="mb-12">
          <h2 className="font-heading text-xl font-semibold text-burgundy mb-4">
            Top 10 wijnen op kliks (30 dagen)
          </h2>
          {topWineRows.length === 0 ? (
            <p className="text-text-light">Geen data beschikbaar.</p>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-text-light">
                    <th className="text-left px-5 py-3 font-medium">#</th>
                    <th className="text-left px-5 py-3 font-medium">Wijn</th>
                    <th className="text-right px-5 py-3 font-medium">Kliks</th>
                  </tr>
                </thead>
                <tbody>
                  {topWineRows.map(({ wine, clicks }, i) => (
                    <tr
                      key={wine?.id ?? i}
                      className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-text-light">{i + 1}</td>
                      <td className="px-5 py-3">
                        {wine ? (
                          <Link
                            href={`/wijn/${wine.slug}`}
                            className="text-burgundy hover:underline"
                          >
                            {wine.name}
                          </Link>
                        ) : (
                          <span className="text-text-light">(onbekend)</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-medium">
                        {clicks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Verdeling per bron */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-burgundy mb-4">
            Verdeling per bron
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {sourceRows.length === 0 ? (
              <p className="px-5 py-4 text-text-light text-sm">Geen data beschikbaar.</p>
            ) : (
              sourceRows.map(([source, count]) => (
                <div key={source} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-foreground font-mono">{source}</span>
                  <span className="text-sm tabular-nums font-medium">{count}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// --- helper component -------------------------------------------------------

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-5">
      <p className="text-sm text-text-light mb-1">{label}</p>
      <p className="font-heading text-3xl font-bold text-burgundy">
        {value.toLocaleString("nl-NL")}
      </p>
    </div>
  );
}
