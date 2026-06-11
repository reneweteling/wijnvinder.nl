import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

function computeToken(userId: string): string {
  return createHmac("sha256", process.env.BETTER_AUTH_SECRET!)
    .update(userId)
    .digest("hex");
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  // Validate token using timing-safe comparison
  const expected = computeToken(uid);
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(token.padEnd(expected.length, " "), "hex");

  let valid = false;
  try {
    valid =
      receivedBuf.length === expectedBuf.length &&
      timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    valid = false;
  }

  if (!uid || !valid) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><title>Ongeldige link</title></head>
<body style="font-family:sans-serif;padding:40px;max-width:480px;margin:0 auto">
<h1 style="color:#722f37">Ongeldige afmeldlink</h1>
<p>Deze link is niet geldig of al verlopen. Log in om je voorkeuren te wijzigen.</p>
<p><a href="/profiel/voorkeuren" style="color:#722f37">Naar voorkeuren</a></p>
</body></html>`,
      { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  // Update the user — use raw db (no auth context needed, token already validated)
  await db.user.update({
    where: { id: uid },
    data: { weeklyDealsOptIn: false },
  });

  return NextResponse.redirect(
    new URL("/profiel/voorkeuren?afgemeld=1", req.nextUrl.origin),
    307,
  );
}
