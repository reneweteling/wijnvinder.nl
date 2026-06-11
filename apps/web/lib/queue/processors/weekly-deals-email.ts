import { db } from "@/lib/db/client";
import { createHmac } from "crypto";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

type DealWine = {
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  discountPct: number;
};

function formatEur(amount: number): string {
  return `€${amount.toFixed(2).replace(".", ",")}`;
}

function buildUnsubscribeToken(userId: string): string {
  return createHmac("sha256", env.BETTER_AUTH_SECRET)
    .update(userId)
    .digest("hex");
}

function buildUnsubscribeUrl(userId: string): string {
  const token = buildUnsubscribeToken(userId);
  return `https://wijnvinder.nl/api/afmelden?uid=${encodeURIComponent(userId)}&token=${token}`;
}

function buildEmailHtml(deals: DealWine[], unsubscribeUrl: string): string {
  const wineRows = deals
    .map(
      (d) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #f0eae6;">
        <a href="https://wijnvinder.nl/wijn/${d.slug}"
           style="font-size:16px;font-weight:600;color:#722f37;text-decoration:none;display:block;margin-bottom:6px;">${d.name}</a>
        <span style="font-size:15px;font-weight:700;color:#1a1a1a;margin-right:10px;">${formatEur(d.price)}</span>
        <span style="font-size:13px;color:#999999;text-decoration:line-through;margin-right:10px;">${formatEur(d.originalPrice)}</span>
        <span style="display:inline-block;background-color:#722f37;color:#ffffff;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;">${d.discountPct}% korting</span>
        <div style="margin-top:10px;">
          <a href="https://wijnvinder.nl/wijn/${d.slug}"
             style="display:inline-block;background-color:#722f37;color:#ffffff;font-size:13px;font-weight:600;padding:8px 18px;border-radius:6px;text-decoration:none;">Bekijk aanbieding</a>
        </div>
      </td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f0;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr><td style="text-align:center;padding:0 0 32px;">
          <span style="font-size:28px;font-weight:700;color:#722f37;letter-spacing:-0.5px;">WijnVinder</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#1a1a1a;">De beste wijnaanbiedingen van deze week</h1>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">
            Wij hebben de beste aanbiedingen voor je op een rij gezet. Mis ze niet.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${wineRows}
          </table>

          <p style="margin:32px 0 0;font-size:13px;line-height:1.5;color:#999999;">
            Je ontvangt deze e-mail omdat je bent aangemeld voor de wekelijkse aanbiedingen.
            <a href="${unsubscribeUrl}" style="color:#722f37;">Afmelden</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="text-align:center;padding:28px 0 0;">
          <p style="margin:0;font-size:12px;color:#999999;">WijnVinder &mdash; Vind jouw perfecte wijn</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function processWeeklyDealsEmail(_job: {
  id: string;
  data: Record<string, never>;
}) {
  console.log("[weekly-deals-email] Starting weekly deals email job");

  // Fetch top deals: available listings with a discount, deduped per canonical wine,
  // sorted by discount percentage descending. Take top 6.
  const listings = await db.shopListing.findMany({
    where: {
      available: true,
      originalPrice: { not: null },
    },
    select: {
      price: true,
      originalPrice: true,
      canonicalWineId: true,
      canonicalWine: {
        select: { name: true, slug: true },
      },
    },
  });

  // Filter to actual discounts (originalPrice > price), dedup per wine, pick highest discount per wine
  const wineMap = new Map<string, DealWine>();
  for (const listing of listings) {
    const orig = listing.originalPrice!;
    if (orig <= listing.price) continue;
    const discountPct = Math.round(((orig - listing.price) / orig) * 100);
    const existing = wineMap.get(listing.canonicalWineId);
    if (!existing || discountPct > existing.discountPct) {
      wineMap.set(listing.canonicalWineId, {
        name: listing.canonicalWine.name,
        slug: listing.canonicalWine.slug,
        price: listing.price,
        originalPrice: orig,
        discountPct,
      });
    }
  }

  const deals = Array.from(wineMap.values())
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 6);

  if (deals.length === 0) {
    console.log("[weekly-deals-email] No deals found, skipping email send");
    return;
  }

  // Fetch all opted-in, verified users
  const users = await db.user.findMany({
    where: {
      weeklyDealsOptIn: true,
      emailVerified: true,
    },
    select: { id: true, email: true, name: true },
  });

  console.log(
    `[weekly-deals-email] Sending to ${users.length} users, ${deals.length} deals`,
  );

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const html = buildEmailHtml(deals, buildUnsubscribeUrl(user.id));
      await sendEmail({
        to: user.email,
        subject: "De beste wijnaanbiedingen van deze week",
        html,
      });
      sent++;
    } catch (err) {
      console.error(
        `[weekly-deals-email] Failed to send to ${user.email}:`,
        err,
      );
      failed++;
    }
  }

  console.log(
    `[weekly-deals-email] Done. Sent: ${sent}, failed: ${failed}`,
  );
}
