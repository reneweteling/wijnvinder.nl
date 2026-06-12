import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";
import { timeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — Beheer — WijnVinder",
};

type QueueRow = {
  name: string;
  state: string;
  count: number;
};

function statusBadge(status: string) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        {status}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
        {status}
      </span>
    );
  }
  // pending, running, or anything else
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
      {status}
    </span>
  );
}

function formatDuration(startedAt: Date | null, completedAt: Date | null): string {
  if (!startedAt || !completedAt) return "-";
  const secs = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);
  return `${secs}s`;
}

export default async function JobsPage() {
  await requireAdmin();

  const scrapeJobs = await db.scrapeJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      shop: { select: { name: true } },
    },
  });

  let queueRows: QueueRow[] | null = null;
  let queueError = false;

  try {
    queueRows = await db.$queryRaw<QueueRow[]>`
      select name, state, count(*)::int as count
      from pgboss.job
      group by name, state
      order by name, state
    `;
  } catch {
    queueError = true;
  }

  return (
    <div className="space-y-10">
      {/* Scrape jobs */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-burgundy mb-4">
          Scrape jobs
        </h2>
        {scrapeJobs.length === 0 ? (
          <p className="text-text-light text-sm">Geen scrape jobs gevonden.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-light">
                  <th className="text-left px-5 py-3 font-medium">Winkel</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Gevonden</th>
                  <th className="text-right px-5 py-3 font-medium">Gematcht</th>
                  <th className="text-left px-5 py-3 font-medium">Gestart</th>
                  <th className="text-right px-5 py-3 font-medium">Duur</th>
                  <th className="text-left px-5 py-3 font-medium">Fout</th>
                </tr>
              </thead>
              <tbody>
                {scrapeJobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {job.shop.name}
                    </td>
                    <td className="px-5 py-3">{statusBadge(job.status)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {job.listingsFound}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {job.listingsMatched}
                    </td>
                    <td className="px-5 py-3 text-text-light">
                      {job.startedAt ? timeAgo(job.startedAt) : "-"}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-text-light">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </td>
                    <td className="px-5 py-3 text-text-light max-w-[220px]">
                      {job.error ? (
                        <span
                          title={job.error}
                          className="block truncate text-red-600 cursor-default"
                        >
                          {job.error}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* pg-boss queue */}
      <section>
        <h2 className="font-heading text-xl font-semibold text-burgundy mb-4">
          Queue (pg-boss)
        </h2>
        {queueError ? (
          <p className="text-text-light text-sm">Queue-tabellen niet beschikbaar.</p>
        ) : queueRows && queueRows.length > 0 ? (
          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-light">
                  <th className="text-left px-5 py-3 font-medium">Queue</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Aantal</th>
                </tr>
              </thead>
              <tbody>
                {queueRows.map((row) => (
                  <tr
                    key={`${row.name}-${row.state}`}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-foreground">{row.name}</td>
                    <td className="px-5 py-3">{statusBadge(row.state)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-text-light text-sm">Geen jobs in de queue.</p>
        )}
      </section>
    </div>
  );
}
