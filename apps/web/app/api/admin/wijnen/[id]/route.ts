import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db/client";

// Nullable trimmed string: trims whitespace, converts "" to null.
const nullableStr = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const patchSchema = z.object({
  name: z.string().trim().min(1, "Naam is verplicht").optional(),
  wineType: z
    .enum(["red", "white", "rose", "sparkling", "dessert"])
    .nullable()
    .optional(),
  grape: nullableStr,
  country: nullableStr,
  region: nullableStr,
  imageUrl: nullableStr,
  description: nullableStr,
  vintage: z
    .number()
    .int()
    .min(1900)
    .max(2100)
    .nullable()
    .optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    const error = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const updated = await db.canonicalWine.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.wineType !== undefined && { wineType: data.wineType }),
        ...(data.grape !== undefined && { grape: data.grape }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.region !== undefined && { region: data.region }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.vintage !== undefined && { vintage: data.vintage }),
      },
      select: {
        id: true,
        slug: true,
        name: true,
        wineType: true,
        grape: true,
        country: true,
        region: true,
        vintage: true,
        imageUrl: true,
        description: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    // Prisma P2025: record not found
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Wijn niet gevonden" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Fout bij opslaan wijn" },
      { status: 500 },
    );
  }
}
