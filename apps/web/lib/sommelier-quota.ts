// Server-only: quota enforcement for the AI sommelier.
// All DB access goes through the raw `db` client (no policy layer needed).

import { createHash } from "crypto";
import { db } from "@/lib/db/client";

export const ANON_DAILY_LIMIT = 3;
export const USER_DAILY_LIMIT = 20;

const WINDOW_MS = 24 * 60 * 60 * 1000; // rolling 24 h

/**
 * Hash an IP address with the auth secret so we never store raw IPs.
 */
export function hashIp(ip: string): string {
  const secret = process.env.BETTER_AUTH_SECRET ?? "";
  return createHash("sha256").update(ip + secret).digest("hex");
}

/**
 * Check whether the caller is within their daily quota.
 * When a userId is provided it takes precedence over ipHash.
 */
export async function checkQuota({
  userId,
  ipHash,
}: {
  userId: string | null | undefined;
  ipHash: string;
}): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const since = new Date(Date.now() - WINDOW_MS);
  const limit = userId ? USER_DAILY_LIMIT : ANON_DAILY_LIMIT;

  const count = userId
    ? await db.sommelierQuestion.count({
        where: { userId, createdAt: { gte: since } },
      })
    : await db.sommelierQuestion.count({
        where: { ipHash, createdAt: { gte: since } },
      });

  const remaining = Math.max(0, limit - count);
  return { allowed: count < limit, remaining, limit };
}

/**
 * Persist a question for quota tracking.
 */
export async function recordQuestion({
  userId,
  ipHash,
  question,
}: {
  userId: string | null | undefined;
  ipHash: string;
  question: string;
}): Promise<void> {
  await db.sommelierQuestion.create({
    data: {
      userId: userId ?? null,
      ipHash,
      question,
    },
  });
}
