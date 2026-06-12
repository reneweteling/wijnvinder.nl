import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const adminNav = [
  { href: "/admin", label: "Overzicht" },
  { href: "/admin/wijnen", label: "Wijnen" },
  { href: "/admin/winkels", label: "Winkels" },
  { href: "/admin/gebruikers", label: "Gebruikers" },
  { href: "/admin/jobs", label: "Jobs" },
  { href: "/stats", label: "Statistieken" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
            Beheer
          </h1>
          <nav className="flex flex-wrap gap-1 border-b border-border pb-4">
            {adminNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground rounded-lg hover:bg-card hover:text-burgundy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
