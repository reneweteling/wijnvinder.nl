import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db/client";

const patchSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { userId } = await params;

  if (userId === admin.id) {
    return NextResponse.json(
      { error: "Je kunt je eigen rol niet wijzigen" },
      { status: 400 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige data" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    const error = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    // Prisma P2025: record not found
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Gebruiker niet gevonden" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Fout bij opslaan" },
      { status: 500 },
    );
  }
}
