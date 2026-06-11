// Re-applies the pg_trgm GIN indexes that `zen db push` drops because
// ZenStack/Prisma cannot declare GIN index types in the schema.
// Chained after db:push in package.json; safe to run repeatedly.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

async function main() {
  const sqlPath = join(__dirname, "../lib/db/sql/trgm-indexes.sql");

  // CREATE INDEX CONCURRENTLY cannot run inside a transaction, so execute
  // each statement as its own query.
  const statements = readFileSync(sqlPath, "utf8")
    .split(";")
    .map((s) => s.replace(/--[^\n]*\n?/g, "\n").trim())
    .filter(Boolean);

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const statement of statements) {
      await client.query(statement);
    }
    console.log(`[trgm] applied ${statements.length} statements`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[trgm] failed:", err);
  process.exit(1);
});
