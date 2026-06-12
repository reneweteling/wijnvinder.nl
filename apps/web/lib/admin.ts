import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

/**
 * Returns the session user only when the DATABASE confirms role === "admin".
 * The DB is the source of truth, not the session claim.
 * Returns null when there is no session or the user is not an admin.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getServerAuthSession();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || user.role !== "admin") return null;

  return user;
}

/**
 * Redirects to /login when there is no session, redirects to / when
 * logged in but not admin. Returns the admin user when authorized.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user || user.role !== "admin") redirect("/");

  return user;
}
