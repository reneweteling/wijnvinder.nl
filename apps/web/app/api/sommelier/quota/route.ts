import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { hashIp, checkQuota } from "@/lib/sommelier-quota";

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession();
  const userId = session?.user?.id ?? null;

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0] : null)?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  const { remaining, limit } = await checkQuota({ userId, ipHash });
  const used = limit - remaining;

  return NextResponse.json({ used, limit, remaining });
}
