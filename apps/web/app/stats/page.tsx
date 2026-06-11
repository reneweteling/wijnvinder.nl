import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stats — WijnVinder",
};

// --- access control ---------------------------------------------------------

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// --- data fetching ----------------------------------------------------------

async function fetchStats() {
  const now = new Date();
  const ago7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalClicks, clicks7d, clicks30d] = await Promise.all([
    db.outboundClick.count(),
    db.outboundClick.count({ where: { createdAt: { gte: ago7 } } }),
    db.outboundClick.count({ where: { createdAt: { gte: ago30 } } }),
  ]);

  // Clicks per shop
  const shops = await db.shop.findMany({ orderBy: { name: "asc" } });
  const shopStats = await Promise.all(
    shops.map(async (shop) => {
      const [total, last30d, last7d] = await Promise.all([
        db.outboundClick.count({ where: { shopId: shop.id } }),
        db.outboundClick.count({
          where: { shopId: shop.id, createdAt: { gte: ago30 } },
        }),
        db.outboundClick.count({
          where: { shopId: shop.id, createdAt: { gte: ago7 } },
        }),
      ]);
      return { shop, total, last30d, last7d };
    })
  );

  // Top 10 wines by clicks in last 30 days
  // Group by canonicalWineId via raw query approach using findMany + groupBy
  const clicksLast30d = await db.outboundClick.findMany({
    where: { createdAt: { gte: ago30 }, canonicalWineId: { not: null } },
    select: { canonicalWineId: true },
  });

  const wineCounts: Record<string, number> = {};
  for (const c of clicksLast30d) {
    if (c.canonicalWineId) {
      wineCounts[c.canonicalWineId] = (wineCounts[c.canonicalWineId] ?? 0) + 1;
    }
  }
  const topWineIds = Object.entries(wineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);

  const topWines = topWineIds.length
    ? await db.canonicalWine.findMany({
        where: { id: { in: topWineIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];

  const topWineRows = topWineIds.map((id) => ({
    wine: topWines.find((w) => w.id === id)!,
    clicks: wineCounts[id],
  }));

  // Source distribution
  const allClicks = await db.outboundClick.findMany({
    select: { source: true },
  });
  const sourceCounts: Record<string, number> = {};
  for (const c of allClicks) {
    const key = c.source ?? "(onbekend)";
    sourceCounts[key] = (sourceCounts[key] ?? 0) + 1;
  }
  const sourceRows = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);

  return { totalClicks, clicks7d, clicks30d, shopStats, topWineRows, sourceRows };
}

// --- page -------------------------------------------------------------------

export default async function StatsPage() {
  const session = await getServerAuthSession();
  const adminEmails = getAdminEmails();

  if (!session?.user || !adminEmails.includes(session.user.email.toLowerCase())) {
    redirect("/login");
  }

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
