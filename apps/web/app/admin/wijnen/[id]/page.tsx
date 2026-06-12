import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { requireAdmin } from "@/lib/admin";
import { WineEditForm } from "./wine-edit-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wine = await db.canonicalWine.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: wine ? `${wine.name} — Beheer` : "Wijn — Beheer" };
}

export default async function AdminWijnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;

  const wine = await db.canonicalWine.findUnique({
    where: { id },
    include: {
      producer: { select: { name: true } },
      listings: {
        include: { shop: { select: { name: true } } },
        orderBy: { price: "asc" },
      },
    },
  });

  if (!wine) notFound();

  const initial = {
    name: wine.name,
    wineType: wine.wineType ?? "",
    grape: wine.grape ?? "",
    country: wine.country ?? "",
    region: wine.region ?? "",
    vintage: wine.vintage ?? null,
    imageUrl: wine.imageUrl ?? "",
    description: wine.description ?? "",
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/wijnen"
          className="text-sm text-text-light hover:text-burgundy transition-colors"
        >
          Wijnen
        </Link>
        <span className="text-text-light/50">/</span>
        <span className="text-sm text-foreground">{wine.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground">
          {wine.name}
        </h2>
        <Link
          href={`/wijn/${wine.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-burgundy hover:underline"
        >
          Bekijk publieke pagina &rarr;
        </Link>
      </div>

      {/* Edit form */}
      <section className="rounded-xl border border-border bg-card px-6 py-6 mb-8">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-5">
          Gegevens bewerken
        </h3>
        <WineEditForm id={id} initial={initial} />
      </section>

      {/* Listings table */}
      <section>
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
          Listings ({wine.listings.length})
        </h3>
        {wine.listings.length === 0 ? (
          <p className="text-sm text-text-light">Geen listings beschikbaar.</p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-text-light">
                  <th className="text-left px-5 py-3 font-medium">Winkel</th>
                  <th className="text-right px-5 py-3 font-medium">Prijs</th>
                  <th className="text-center px-5 py-3 font-medium">Beschikbaar</th>
                  <th className="text-left px-5 py-3 font-medium">Link</th>
                </tr>
              </thead>
              <tbody>
                {wine.listings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="border-b border-border last:border-0 hover:bg-surface/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-foreground">
                      {listing.shop.name}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {listing.price.toLocaleString("nl-NL", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {listing.available ? (
                        <span className="text-green-600 font-medium">Ja</span>
                      ) : (
                        <span className="text-text-light">Nee</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy hover:underline truncate block max-w-xs"
                      >
                        Naar product &rarr;
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
