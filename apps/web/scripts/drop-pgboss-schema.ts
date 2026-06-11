// Drops the pgboss schema from the database.
// Only runs when called with --yes to prevent accidental data loss.
// Usage: node --import tsx scripts/drop-pgboss-schema.ts --yes
import pg from "pg";

const withYes = process.argv.includes("--yes");

if (!withYes) {
  console.log(
    "Safety guard: pass --yes to actually drop the pgboss schema.\n" +
    "  node --import tsx scripts/drop-pgboss-schema.ts --yes\n" +
    "No changes made.",
  );
  process.exit(0);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("DROP SCHEMA IF EXISTS pgboss CASCADE");
    console.log("[drop-pgboss] pgboss schema dropped");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[drop-pgboss] failed:", err);
  process.exit(1);
});
