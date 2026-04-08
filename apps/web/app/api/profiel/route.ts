import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { db } from "@/lib/db/client";
import type { WineProfileData } from "@/lib/types";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const profile = await db.wineProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(null, { status: 404 });
    }

    const profileData: WineProfileData = {
      wineTypes: profile.wineTypes as WineProfileData["wineTypes"],
      grapes: profile.grapes,
      flavors: profile.flavors as WineProfileData["flavors"],
      countries: profile.countries,
      priceMin: profile.priceMin,
      priceMax: profile.priceMax,
    };

    return NextResponse.json(profileData);
  } catch {
    return NextResponse.json(
      { error: "Fout bij ophalen profiel" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let body: WineProfileData;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });
  }

  try {
    const profile = await db.wineProfile.upsert({
      where: { userId: session.user.id },
      update: {
        wineTypes: body.wineTypes,
        grapes: body.grapes,
        flavors: body.flavors,
        countries: body.countries,
        priceMin: body.priceMin,
        priceMax: body.priceMax,
      },
      create: {
        userId: session.user.id,
        wineTypes: body.wineTypes,
        grapes: body.grapes,
        flavors: body.flavors,
        countries: body.countries,
        priceMin: body.priceMin,
        priceMax: body.priceMax,
      },
    });

    return NextResponse.json(profile);
  } catch {
    return NextResponse.json(
      { error: "Fout bij opslaan profiel" },
      { status: 500 },
    );
  }
}
