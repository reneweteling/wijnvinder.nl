import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";
import { UsersTable, type UserRow } from "./users-table";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gebruikers — Beheer — WijnVinder",
};

export default async function GebruikersPage() {
  const admin = await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      weeklyDealsOptIn: true,
      createdAt: true,
      _count: { select: { favorites: true } },
    },
  });

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    weeklyDealsOptIn: user.weeklyDealsOptIn,
    favoriteCount: user._count.favorites,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div>
      <p className="text-text-light mb-6">
        {users.length} gebruiker{users.length !== 1 ? "s" : ""} (max. 100 weergegeven)
      </p>

      <UsersTable data={rows} adminId={admin.id} />
    </div>
  );
}
