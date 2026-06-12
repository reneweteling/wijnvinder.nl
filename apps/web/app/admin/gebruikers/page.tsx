import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db/client";
import { timeAgo } from "@/lib/time";
import { RoleToggle } from "./role-toggle";

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

  return (
    <div>
      <p className="text-text-light mb-6">
        {users.length} gebruiker{users.length !== 1 ? "s" : ""} (max. 100 weergegeven)
      </p>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-text-light">
              <th className="text-left px-5 py-3 font-medium">Naam</th>
              <th className="text-left px-5 py-3 font-medium">E-mail</th>
              <th className="text-left px-5 py-3 font-medium">Rol</th>
              <th className="text-left px-5 py-3 font-medium">Geverifieerd</th>
              <th className="text-left px-5 py-3 font-medium">Nieuwsbrief</th>
              <th className="text-right px-5 py-3 font-medium">Favorieten</th>
              <th className="text-left px-5 py-3 font-medium">Lid sinds</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
              >
                <td className="px-5 py-3 font-medium text-foreground">
                  {user.name ?? <span className="text-text-light italic">—</span>}
                </td>
                <td className="px-5 py-3 text-text-light">{user.email}</td>
                <td className="px-5 py-3">
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-burgundy text-white">
                      admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border text-text-light">
                      gebruiker
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {user.emailVerified ? (
                    <span className="text-green-600">ja</span>
                  ) : (
                    <span className="text-text-light">nee</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {user.weeklyDealsOptIn ? (
                    <span className="text-green-600">ja</span>
                  ) : (
                    <span className="text-text-light">nee</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {user._count.favorites}
                </td>
                <td className="px-5 py-3 text-text-light">
                  {timeAgo(user.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <RoleToggle
                    userId={user.id}
                    currentRole={user.role}
                    isSelf={user.id === admin.id}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
