"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { timeAgo } from "@/lib/time";
import { DataTable, type ColMeta } from "@/components/admin/data-table";

export type JobRow = {
  id: string;
  shopName: string;
  status: string;
  listingsFound: number;
  listingsMatched: number;
  startedAt: string | null; // ISO string
  completedAt: string | null; // ISO string
  durationSeconds: number | null;
  error: string | null;
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
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
      {status}
    </span>
  );
}

const columns: ColumnDef<JobRow, unknown>[] = [
  {
    accessorKey: "shopName",
    enableSorting: true,
    meta: {
      th: "text-left px-5 py-3 font-medium",
      td: "px-5 py-3 font-medium text-foreground",
    } satisfies ColMeta,
    header: () => "Winkel",
    cell: ({ row }) => row.original.shopName,
  },
  {
    accessorKey: "status",
    enableSorting: true,
    meta: {
      th: "text-left px-5 py-3 font-medium",
      td: "px-5 py-3",
    } satisfies ColMeta,
    header: () => "Status",
    cell: ({ row }) => statusBadge(row.original.status),
  },
  {
    accessorKey: "listingsFound",
    enableSorting: true,
    meta: {
      th: "text-right px-5 py-3 font-medium",
      td: "px-5 py-3 text-right tabular-nums",
    } satisfies ColMeta,
    header: () => "Gevonden",
    cell: ({ row }) => row.original.listingsFound,
  },
  {
    accessorKey: "listingsMatched",
    enableSorting: true,
    meta: {
      th: "text-right px-5 py-3 font-medium",
      td: "px-5 py-3 text-right tabular-nums",
    } satisfies ColMeta,
    header: () => "Gematcht",
    cell: ({ row }) => row.original.listingsMatched,
  },
  {
    accessorKey: "startedAt",
    enableSorting: true,
    meta: {
      th: "text-left px-5 py-3 font-medium",
      td: "px-5 py-3 text-text-light",
    } satisfies ColMeta,
    header: () => "Gestart",
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.startedAt
        ? new Date(rowA.original.startedAt).getTime()
        : 0;
      const b = rowB.original.startedAt
        ? new Date(rowB.original.startedAt).getTime()
        : 0;
      return a - b;
    },
    cell: ({ row }) =>
      row.original.startedAt ? timeAgo(row.original.startedAt) : "-",
    sortUndefined: "last",
  },
  {
    accessorKey: "durationSeconds",
    enableSorting: true,
    meta: {
      th: "text-right px-5 py-3 font-medium",
      td: "px-5 py-3 text-right tabular-nums text-text-light",
    } satisfies ColMeta,
    header: () => "Duur",
    cell: ({ row }) =>
      row.original.durationSeconds != null
        ? `${row.original.durationSeconds}s`
        : "-",
    sortUndefined: "last",
  },
  {
    id: "error",
    enableSorting: false,
    meta: {
      th: "text-left px-5 py-3 font-medium",
      td: "px-5 py-3 text-text-light max-w-[220px]",
    } satisfies ColMeta,
    header: () => "Fout",
    cell: ({ row }) =>
      row.original.error ? (
        <span
          title={row.original.error}
          className="block truncate text-red-600 cursor-default"
        >
          {row.original.error}
        </span>
      ) : (
        "-"
      ),
  },
];

export function JobsTable({ data }: { data: JobRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
