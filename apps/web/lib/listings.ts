/**
 * Selecteer de "aangeprezen" listing voor een wijn.
 *
 * Regel: de winkel met de hoogste `priority` wint altijd, ongeacht de prijs.
 * Dit is bewust zo om de hoogste commissie te halen wanneer dezelfde wijn bij
 * meerdere winkels te koop staat. Bij gelijke prioriteit wint de laagste prijs.
 *
 * We doen dit in JS (niet via orderBy) omdat Prisma de relatie-orderBy negeert
 * binnen een geneste include. Listings van niet-actieve winkels horen al uit de
 * query gefilterd te zijn; `available` checken we hier defensief nog een keer.
 */
export function pickPromotedListing<
  T extends {
    price: number;
    available?: boolean;
    shop?: { priority?: number | null } | null;
  },
>(listings: T[]): T | null {
  let best: T | null = null;

  for (const listing of listings) {
    if (listing.available === false) continue;

    if (best === null) {
      best = listing;
      continue;
    }

    const bestPriority = best.shop?.priority ?? 0;
    const priority = listing.shop?.priority ?? 0;

    if (priority > bestPriority) {
      best = listing;
    } else if (priority === bestPriority && listing.price < best.price) {
      best = listing;
    }
  }

  return best;
}
