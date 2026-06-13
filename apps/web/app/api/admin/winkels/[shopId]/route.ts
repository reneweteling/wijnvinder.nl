import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db/client";

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  priority: z.number().int().optional(),
  referralEnabled: z.boolean().optional(),
  referralParam: z.string().optional().nullable(),
  affiliateLinkTemplate: z.string().optional().nullable(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { shopId } = await params;

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

  const body = parsed.data;

  // Trim strings; empty string -> null
  const referralParam =
    body.referralParam !== undefined
      ? body.referralParam === null || body.referralParam.trim() === ""
        ? null
        : body.referralParam.trim()
      : undefined;

  const affiliateLinkTemplate =
    body.affiliateLinkTemplate !== undefined
      ? body.affiliateLinkTemplate === null ||
        body.affiliateLinkTemplate.trim() === ""
        ? null
        : body.affiliateLinkTemplate.trim()
      : undefined;

  if (
    affiliateLinkTemplate !== undefined &&
    affiliateLinkTemplate !== null &&
    !affiliateLinkTemplate.startsWith("https://")
  ) {
    return NextResponse.json(
      { error: "Affiliate-linksjabloon moet beginnen met https://" },
      { status: 400 },
    );
  }

  try {
    const updated = await db.shop.update({
      where: { id: shopId },
      data: {
        ...(body.enabled !== undefined && { enabled: body.enabled }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.referralEnabled !== undefined && {
          referralEnabled: body.referralEnabled,
        }),
        ...(referralParam !== undefined && { referralParam }),
        ...(affiliateLinkTemplate !== undefined && { affiliateLinkTemplate }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        enabled: true,
        priority: true,
        referralEnabled: true,
        referralParam: true,
        affiliateLinkTemplate: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Fout bij opslaan winkel" },
      { status: 500 },
    );
  }
}
