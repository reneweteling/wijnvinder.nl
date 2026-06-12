import Link from "next/link";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/admin";
import { WinesTable, type WineRow } from "./wines-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wijnen — Beheer",
};

const PAGE_SIZE = 50;

type SortKey =
  | "name"
  | "producer"
  | "wineType"
  | "grape"
  | "country"
  | "vintage"
  | "vivinoScore"
  | "listings";

const SORT_KEYS: SortKey[] = [
  "name",
  "producer",
  "wineType",
  "grape",
  "country",
  "vintage",
  "vivinoScore",
  "listings",
];

function buildOrderBy(sort: SortKey, dir: "asc" | "desc") {
  switch (sort) {
    case "producer":
      return { producer: { name: dir } };
    case "listings":
      return { listings: { _count: dir } };
    case "vintage":
      return { vintage: { sort: dir, nulls: "last" as const } };
    case "vivinoScore":
      return { vivinoScore: { sort: dir, nulls: "last" as const } };
    case "grape":
      return { grape: { sort: dir, nulls: "last" as const } };
    case "country":
      return { country: { sort: dir, nulls: "last" as const } };
    case "wineType":
      return { wineType: { sort: dir, nulls: "last" as const } };
    case "name":
    default:
      return { name: dir };
  }
}

export default async function AdminWijnenPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
    sort?: string;
    dir?: string;
  }>;
}) {
  await requireAdmin();

  const {
    q,
    type,
    page: pageParam,
    sort: sortParam,
    dir: dirParam,
  } = await searchParams;

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const query = q?.trim() ?? "";
  const wineType = type?.trim() ?? "";

  const sort: SortKey = SORT_KEYS.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "name";
  const dir: "asc" | "desc" = dirParam === "asc" ? "asc" : "desc";

  // When no explicit sort is in the URL, fall back to updatedAt desc.
  const orderBy =
    sortParam && SORT_KEYS.includes(sortParam as SortKey)
      ? buildOrderBy(sort, dir)
      : { updatedAt: "desc" as const };

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" as const } },
            { searchName: { contains: query, mode: "insensitive" as const } },
            { grape: { contains: query, mode: "insensitive" as const } },
            { country: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(wineType ? { wineType } : {}),
  };

  const [total, wines] = await Promise.all([
    db.canonicalWine.count({ where }),
    db.canonicalWine.findMany({
      where,
      orderBy,
      take: PAGE_SIZE,
      skip,
      include: {
        producer: { select: { name: true } },
        _count: { select: { listings: true } },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const rows: WineRow[] = wines.map((wine) => ({
    id: wine.id,
    slug: wine.slug,
    name: wine.name,
    producer: wine.producer?.name ?? null,
    wineType: wine.wineType,
    grape: wine.grape,
    country: wine.country,
    vintage: wine.vintage,
    vivinoScore: wine.vivinoScore,
    imageUrl: wine.imageUrl,
    listingCount: wine._count.listings,
  }));

  // Active sort for URL — only set when a real sort key is active.
  const activeSort = sortParam && SORT_KEYS.includes(sortParam as SortKey)
    ? sort
    : null;
  const activeDir = activeSort ? dir : null;

  function buildHref(overrides: {
    page?: number;
    q?: string;
    type?: string;
    sort?: string | null;
    dir?: string | null;
  }) {
    const params = new URLSearchParams();
    const newQ = overrides.q !== undefined ? overrides.q : query;
    const newType = overrides.type !== undefined ? overrides.type : wineType;
    const newPage = overrides.page ?? page;
    const newSort =
      overrides.sort !== undefined ? overrides.sort : activeSort;
    const newDir =
      overrides.dir !== undefined ? overrides.dir : activeDir;
    if (newQ) params.set("q", newQ);
    if (newType) params.set("type", newType);
    if (newSort) params.set("sort", newSort);
    if (newDir) params.set("dir", newDir);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    return `/admin/wijnen${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Wijnen</h2>
        <span className="text-sm text-text-light">
          {total.toLocaleString("nl-NL")} wijnen gevonden
        </span>
      </div>

      {/* Search form — submitting resets to page 1; sort is NOT a form field
          so it is dropped on new search (intentional). */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Zoek op naam, druif, land..."
          className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm flex-1 min-w-48 placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
        />
        <select
          name="type"
          defaultValue={wineType}
          className="h-10 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
        >
          <option value="">Alle types</option>
          <option value="red">Rood</option>
          <option value="white">Wit</option>
          <option value="rose">Rosé</option>
          <option value="sparkling">Mousserend</option>
          <option value="dessert">Dessert</option>
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-lg bg-burgundy text-white text-sm font-medium hover:bg-burgundy/90 transition-colors"
        >
          Zoeken
        </button>
      </form>

      {/* Table */}
      <WinesTable
        data={rows}
        sort={activeSort}
        dir={activeDir}
        buildHref={buildHref}
      />

      {/* Pagination */}
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
