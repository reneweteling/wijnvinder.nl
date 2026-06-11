import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// Appends the shop's referral param (e.g. "?ref=wijnvinder") to a target URL
function withReferral(url: string, referralParam: string | null): string {
  if (!referralParam) return url;
  const param = referralParam.replace(/^[?&]/, "");
  if (!param) return url;
  return url.includes("?") ? `${url}&${param}` : `${url}?${param}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;

  const listing = await db.shopListing.findUnique({
    where: { id: listingId },
    include: { shop: true },
  });

  if (!listing) {
    return NextResponse.redirect(new URL("/aanbevelingen", request.url));
  }

  const source = request.nextUrl.searchParams.get("bron");

  try {
    await db.outboundClick.create({
      data: {
        shopId: listing.shopId,
        listingId: listing.id,
        canonicalWineId: listing.canonicalWineId,
        source,
        referer: request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      },
    });
  } catch (error) {
    // Tracking must never block the redirect
    console.error("[GET /uit]", error);
  }

  const target = withReferral(
    listing.url,
    listing.shop.referralEnabled ? listing.shop.referralParam : null
  );

  return NextResponse.redirect(target, { status: 302 });
}
