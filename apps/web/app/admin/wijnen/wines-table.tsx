"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { DataTable, type ColMeta } from "@/components/admin/data-table";

const WINE_TYPE_LABELS: Record<string, string> = {
  red: "Rood",
  white: "Wit",
  rose: "Rosé",
  sparkling: "Mousserend",
  dessert: "Dessert",
};

export type WineRow = {
  id: string;
  slug: string | null;
  name: string;
  producer: string | null;
  wineType: string | null;
  grape: string | null;
  country: string | null;
  vintage: number | null;
  vivinoScore: number | null;
  imageUrl: string | null;
  listingCount: number;
};

const columns: ColumnDef<WineRow, unknown>[] = [
  {
    id: "thumbnail",
    enableSorting: false,
    meta: { th: "text-left px-4 py-3 font-medium w-12", td: "px-4 py-2" } satisfies ColMeta,
    header: () => null,
    cell: ({ row }) =>
      row.original.imageUrl ? (
        <Image
          src={row.original.imageUrl}
          alt={row.original.name}
          width={32}
          height={32}
          className="w-8 h-8 object-contain rounded"
          unoptimized
        />
      ) : (
        <div className="w-8 h-8 rounded bg-surface border border-border" />
      ),
  },
  {
    accessorKey: "name",
    enableSorting: true,
    meta: { th: "text-left px-4 py-3 font-medium", td: "px-4 py-2" } satisfies ColMeta,
    header: () => "Naam",
    cell: ({ row }) => (
      <Link
        href={`/admin/wijnen/${row.original.id}`}
        className="text-burgundy hover:underline font-medium"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "producer",
    enableSorting: true,
    meta: {
      th: "text-left px-4 py-3 font-medium hidden md:table-cell",
      td: "px-4 py-2 text-text-light hidden md:table-cell",
    } satisfies ColMeta,
    header: () => "Producent",
    cell: ({ row }) =>
      row.original.producer ?? <span className="text-text-light/50">—</span>,
    sortUndefined: "last",
  },
  {
    accessorKey: "wineType",
    enableSorting: true,
    meta: {
      th: "text-left px-4 py-3 font-medium hidden sm:table-cell",
      td: "px-4 py-2 hidden sm:table-cell",
    } satisfies ColMeta,
    header: () => "Type",
    cell: ({ row }) =>
      row.original.wineType ? (
        WINE_TYPE_LABELS[row.original.wineType] ?? row.original.wineType
      ) : (
        <span className="text-text-light/50">—</span>
      ),
    sortUndefined: "last",
  },
  {
    accessorKey: "grape",
    enableSorting: true,
    meta: {
      th: "text-left px-4 py-3 font-medium hidden lg:table-cell",
      td: "px-4 py-2 text-text-light hidden lg:table-cell",
    } satisfies ColMeta,
    header: () => "Druif",
    cell: ({ row }) =>
      row.original.grape ?? <span className="text-text-light/50">—</span>,
    sortUndefined: "last",
  },
  {
    accessorKey: "country",
    enableSorting: true,
    meta: {
      th: "text-left px-4 py-3 font-medium hidden lg:table-cell",
      td: "px-4 py-2 text-text-light hidden lg:table-cell",
    } satisfies ColMeta,
    header: () => "Land",
    cell: ({ row }) =>
      row.original.country ?? <span className="text-text-light/50">—</span>,
    sortUndefined: "last",
  },
  {
    accessorKey: "vintage",
    enableSorting: true,
    meta: {
      th: "text-right px-4 py-3 font-medium hidden sm:table-cell",
      td: "px-4 py-2 text-right tabular-nums hidden sm:table-cell text-text-light",
    } satisfies ColMeta,
    header: () => "Jaar",
    cell: ({ row }) =>
      row.original.vintage ?? <span className="text-text-light/50">—</span>,
    sortUndefined: "last",
  },
  {
    accessorKey: "vivinoScore",
    enableSorting: true,
    meta: {
      th: "text-right px-4 py-3 font-medium hidden md:table-cell",
      td: "px-4 py-2 text-right tabular-nums hidden md:table-cell text-text-light",
    } satisfies ColMeta,
    header: () => "Score",
    cell: ({ row }) =>
      row.original.vivinoScore != null ? (
        row.original.vivinoScore.toFixed(1)
      ) : (
        <span className="text-text-light/50">—</span>
      ),
    sortUndefined: "last",
  },
  {
    accessorKey: "listingCount",
    enableSorting: true,
    meta: {
      th: "text-right px-4 py-3 font-medium",
      td: "px-4 py-2 text-right tabular-nums font-medium",
    } satisfies ColMeta,
    header: () => "Listings",
    cell: ({ row }) => row.original.listingCount,
  },
];

export function WinesTable({ data }: { data: WineRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
