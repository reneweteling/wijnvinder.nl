import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerAuthSession } from "@/lib/auth";
import { authDb } from "@/lib/db/client";
import { WINE_TYPES, GRAPES, COUNTRIES, FLAVORS } from "@/lib/constants";
import type { WineProfileData } from "@/lib/types";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const profile = await authDb(session.user).wineProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      // 200 + null so the client can distinguish "no profile yet" from auth errors
      // without triggering console errors on a 404.
      return NextResponse.json(null, { status: 200 });
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

const wineTypeValues = WINE_TYPES.map((t) => t.value);
const grapeValues = [...GRAPES];
const countryValues = COUNTRIES.map((c) => c.value);
const flavorValues = FLAVORS.map((f) => f.value);

const profileSchema = z
  .object({
    wineTypes: z.array(z.enum(wineTypeValues as [string, ...string[]])),
    grapes: z.array(z.enum(grapeValues as [string, ...string[]])),
    countries: z.array(z.enum(countryValues as [string, ...string[]])),
    flavors: z.array(z.enum(flavorValues as [string, ...string[]])),
    priceMin: z.number().positive(),
    priceMax: z.number().positive(),
  })
  .refine((d) => d.priceMin < d.priceMax, {
    message: "priceMin moet kleiner zijn dan priceMax",
    path: ["priceMin"],
  });

export async function PUT(request: Request) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const error = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error }, { status: 400 });
  }

  const body = parsed.data;

  try {
    await authDb(session.user).wineProfile.upsert({
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

    const profileData: WineProfileData = {
      wineTypes: body.wineTypes as WineProfileData["wineTypes"],
      grapes: body.grapes,
      flavors: body.flavors as WineProfileData["flavors"],
      countries: body.countries,
      priceMin: body.priceMin,
      priceMax: body.priceMax,
    };

    return NextResponse.json(profileData);
  } catch {
    return NextResponse.json(
      { error: "Fout bij opslaan profiel" },
      { status: 500 },
    );
  }
}
