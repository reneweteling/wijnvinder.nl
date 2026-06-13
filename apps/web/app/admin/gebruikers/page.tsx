import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";
import { UsersTable, type UserRow } from "./users-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gebruikers — Beheer — WijnVinder",
};

const PAGE_SIZE = 25;

export default async function GebruikersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await requireAdmin();

  const { q, page: pageParam } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const query = q?.trim() ?? "";

  const where = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        weeklyDealsOptIn: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { favorites: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    weeklyDealsOptIn: user.weeklyDealsOptIn,
    favoriteCount: user._count.favorites,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  }));

  function buildHref(overrides: { page?: number; q?: string }) {
    const params = new URLSearchParams();
    const newQ = overrides.q !== undefined ? overrides.q : query;
    const newPage = overrides.page ?? page;
    if (newQ) params.set("q", newQ);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    return `/admin/gebruikers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Gebruikers</h2>
        <span className="text-sm text-text-light">
          {total.toLocaleString("nl-NL")} gebruiker{total !== 1 ? "s" : ""} gevonden
        </span>
      </div>

      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Zoek op naam of e-mail"
          className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm flex-1 min-w-48 placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
        />
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-burgundy text-white text-sm font-medium hover:bg-burgundy/90 transition-colors"
        >
          Zoeken
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card overflow-x-auto mb-6">
        <UsersTable data={rows} adminId={admin.id} />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3">
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
    </div>
  );
}
