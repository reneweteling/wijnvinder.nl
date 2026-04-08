import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { getServerAuthSession } from "@/lib/auth";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const favorites = await db.favoriteWine.findMany({
    where: { userId: session.user.id },
    include: {
      wine: {
        include: {
          listings: {
            where: { available: true },
            orderBy: { price: "asc" as const },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = favorites.map((fav) => {
    const cheapest = fav.wine.listings[0];
    return {
      id: fav.id,
      wineId: fav.wineId,
      notes: fav.notes,
      createdAt: fav.createdAt,
      wine: {
        ...fav.wine,
        listings: undefined,
        bestPrice: cheapest?.price ?? null,
        originalPrice: cheapest?.originalPrice ?? null,
        shopCount: fav.wine.listings.length,
      },
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const body = await request.json();
  const { wineId } = body;

  if (!wineId || typeof wineId !== "string") {
    return NextResponse.json({ error: "wineId is verplicht" }, { status: 400 });
  }

  // Toggle: if already favorited, remove it
  const existing = await db.favoriteWine.findUnique({
    where: { userId_wineId: { userId: session.user.id, wineId } },
  });

  if (existing) {
    await db.favoriteWine.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  const favorite = await db.favoriteWine.create({
    data: { userId: session.user.id, wineId },
  });

  return NextResponse.json({ favorited: true, id: favorite.id });
}

export async function PUT(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) return NextResponse.json(null, { status: 401 });

  const body = await request.json();
  const { wineId, notes } = body;

  if (!wineId || typeof wineId !== "string") {
    return NextResponse.json({ error: "wineId is verplicht" }, { status: 400 });
  }

  const favorite = await db.favoriteWine.findUnique({
    where: { userId_wineId: { userId: session.user.id, wineId } },
  });

  if (!favorite) {
    return NextResponse.json({ error: "Favoriet niet gevonden" }, { status: 404 });
  }

  await db.favoriteWine.update({
    where: { id: favorite.id },
    data: { notes: notes ?? null },
  });

  return NextResponse.json({ ok: true });
}
