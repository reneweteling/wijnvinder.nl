-- Backfill lastLoginAt from session data (best-effort: use max session createdAt per user)
UPDATE "user" u
SET "lastLoginAt" = s.last
FROM (
  SELECT "userId", max("createdAt") AS last
  FROM "session"
  GROUP BY "userId"
) s
WHERE u.id = s."userId"
  AND u."lastLoginAt" IS NULL;
