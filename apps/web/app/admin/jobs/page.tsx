import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";
import { JobsTable, type JobRow } from "./jobs-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jobs — Beheer — WijnVinder",
};

type QueueRow = {
  name: string;
  state: string;
  count: number;
};

const PAGE_SIZE = 25;

const VALID_STATUSES = ["completed", "running", "pending", "failed"] as const;
type JobStatus = (typeof VALID_STATUSES)[number];

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

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireAdmin();

  const { q, status: statusParam, page: pageParam } = await searchParams;

  const query = q?.trim() ?? "";
  const statusFilter = VALID_STATUSES.includes(statusParam as JobStatus)
    ? (statusParam as JobStatus)
    : "";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(query
      ? { shop: { name: { contains: query, mode: "insensitive" as const } } }
      : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  function buildHref(overrides: { page?: number; q?: string; status?: string }) {
    const params = new URLSearchParams();
    const newQ = overrides.q !== undefined ? overrides.q : query;
    const newStatus =
      overrides.status !== undefined ? overrides.status : statusFilter;
    const newPage = overrides.page ?? page;
    if (newQ) params.set("q", newQ);
    if (newStatus) params.set("status", newStatus);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    return `/admin/jobs${qs ? `?${qs}` : ""}`;
  }

  const [total, scrapeJobs] = await Promise.all([
    db.scrapeJob.count({ where }),
    db.scrapeJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        shop: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

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

  const jobRows: JobRow[] = scrapeJobs.map((job) => {
    const durationSeconds =
      job.startedAt && job.completedAt
        ? Math.round(
            (job.completedAt.getTime() - job.startedAt.getTime()) / 1000
          )
        : null;
    return {
      id: job.id,
      shopName: job.shop.name,
      status: job.status,
      listingsFound: job.listingsFound,
      listingsMatched: job.listingsMatched,
      startedAt: job.startedAt ? job.startedAt.toISOString() : null,
      completedAt: job.completedAt ? job.completedAt.toISOString() : null,
      durationSeconds,
      error: job.error,
    };
  });

  return (
    <div className="space-y-10">
      {/* Scrape jobs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-semibold text-burgundy">
            Scrape jobs
          </h2>
          <span className="text-sm text-text-light">
            {total.toLocaleString("nl-NL")} jobs gevonden
          </span>
        </div>

        {/* Search form */}
        <form method="GET" className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Zoek op winkel"
            className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm flex-1 min-w-48 placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
          />
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
          >
            <option value="">Alle statussen</option>
            <option value="completed">completed</option>
            <option value="running">running</option>
            <option value="pending">pending</option>
            <option value="failed">failed</option>
          </select>
          <button
            type="submit"
            className="h-10 px-4 rounded-lg bg-burgundy text-white text-sm font-medium hover:bg-burgundy/90 transition-colors"
          >
            Zoeken
          </button>
        </form>

        {scrapeJobs.length === 0 ? (
          <p className="text-text-light text-sm">Geen scrape jobs gevonden.</p>
        ) : (
          <JobsTable data={jobRows} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-4">
            {page > 1 ? (
              <Link
                href={buildHref({ page: page - 1 })}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-card hover:bg-surface transition-colors"
              >
                Vorige
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm rounded-lg border border-border bg-surface text-text-light/50 cursor-not-allowed">
                Vorige
              </span>
            )}
            <span className="text-sm text-text-light">
              Pagina {page} van {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={buildHref({ page: page + 1 })}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-card hover:bg-surface transition-colors"
              >
                Volgende
              </Link>
            ) : (
              <span className="px-4 py-2 text-sm rounded-lg border border-border bg-surface text-text-light/50 cursor-not-allowed">
                Volgende
              </span>
            )}
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
