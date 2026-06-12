"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { timeAgo } from "@/lib/time";
import { DataTable, type ColMeta } from "@/components/admin/data-table";
import { RoleToggle } from "./role-toggle";

export type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  emailVerified: boolean;
  weeklyDealsOptIn: boolean;
  favoriteCount: number;
  createdAt: string; // ISO string
};

function buildColumns(adminId: string): ColumnDef<UserRow, unknown>[] {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3 font-medium text-foreground",
      } satisfies ColMeta,
      header: () => "Naam",
      cell: ({ row }) =>
        row.original.name ?? (
          <span className="text-text-light italic">—</span>
        ),
      sortUndefined: "last",
    },
    {
      accessorKey: "email",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3 text-text-light",
      } satisfies ColMeta,
      header: () => "E-mail",
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "role",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3",
      } satisfies ColMeta,
      header: () => "Rol",
      cell: ({ row }) =>
        row.original.role === "admin" ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-burgundy text-white">
            admin
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border text-text-light">
            gebruiker
          </span>
        ),
    },
    {
      accessorKey: "emailVerified",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3",
      } satisfies ColMeta,
      header: () => "Geverifieerd",
      cell: ({ row }) =>
        row.original.emailVerified ? (
          <span className="text-green-600">ja</span>
        ) : (
          <span className="text-text-light">nee</span>
        ),
    },
    {
      accessorKey: "weeklyDealsOptIn",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3",
      } satisfies ColMeta,
      header: () => "Nieuwsbrief",
      cell: ({ row }) =>
        row.original.weeklyDealsOptIn ? (
          <span className="text-green-600">ja</span>
        ) : (
          <span className="text-text-light">nee</span>
        ),
    },
    {
      accessorKey: "favoriteCount",
      enableSorting: true,
      meta: {
        th: "text-right px-5 py-3 font-medium",
        td: "px-5 py-3 text-right tabular-nums",
      } satisfies ColMeta,
      header: () => "Favorieten",
      cell: ({ row }) => row.original.favoriteCount,
    },
    {
      accessorKey: "createdAt",
      enableSorting: true,
      meta: {
        th: "text-left px-5 py-3 font-medium",
        td: "px-5 py-3 text-text-light",
      } satisfies ColMeta,
      header: () => "Lid sinds",
      sortingFn: (rowA, rowB) =>
        new Date(rowA.original.createdAt).getTime() -
        new Date(rowB.original.createdAt).getTime(),
      cell: ({ row }) => timeAgo(row.original.createdAt),
    },
    {
      id: "action",
      enableSorting: false,
      meta: {
        th: "px-5 py-3",
        td: "px-5 py-3",
      } satisfies ColMeta,
      header: () => null,
      cell: ({ row }) => (
        <RoleToggle
          userId={row.original.id}
          currentRole={row.original.role}
          isSelf={row.original.id === adminId}
        />
      ),
    },
  ];
}

export function UsersTable({
  data,
  adminId,
}: {
  data: UserRow[];
  adminId: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-x-auto">
      <DataTable columns={buildColumns(adminId)} data={data} />
    </div>
  );
}
