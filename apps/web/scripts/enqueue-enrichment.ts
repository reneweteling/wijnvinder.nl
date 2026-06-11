/**
 * Backfill enrichment: enqueue ENRICH_VIVINO and/or ENRICH_LISTING jobs for wines
 * that are missing Vivino scores or descriptions.
 *
 * Usage:
 *   node --import tsx apps/web/scripts/enqueue-enrichment.ts               # dry-run, shows counts
 *   node --import tsx apps/web/scripts/enqueue-enrichment.ts --vivino      # enqueue Vivino jobs
 *   node --import tsx apps/web/scripts/enqueue-enrichment.ts --descriptions # enqueue listing jobs
 *   node --import tsx apps/web/scripts/enqueue-enrichment.ts --vivino --descriptions # both
 *   node --import tsx apps/web/scripts/enqueue-enrichment.ts --vivino --limit=25    # cap at 25
 *
 * Run the worker afterwards to process the jobs:
 *   pnpm --filter web worker
 */

import { db } from "../lib/db/client";
import { QueueClient } from "../lib/queue/client";
import { JobType } from "../lib/queue/types";

function parseArgs(): { vivino: boolean; descriptions: boolean; limit: number; dryRun: boolean } {
  const argv = process.argv.slice(2);
  const has = (flag: string) => argv.includes(flag);
  const get = (flag: string): string | null => {
    const entry = argv.find((a) => a.startsWith(`--${flag}=`));
    return entry ? entry.slice(flag.length + 3) : null;
  };

  const vivino = has("--vivino");
  const descriptions = has("--descriptions");
  const limitStr = get("limit");
  const limit = limitStr ? parseInt(limitStr, 10) : Infinity;

  const dryRun = !vivino && !descriptions;

  return { vivino, descriptions, limit, dryRun };
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.dryRun) {
    console.log("Dry-run mode. Pass --vivino and/or --descriptions to enqueue jobs.\n");
  }

  // Count wines missing vivinoScore
  const missingVivino = await db.canonicalWine.findMany({
    where: { vivinoScore: null },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  // Count wines missing description (with at least one available listing to fetch from)
  const missingDescription = await db.canonicalWine.findMany({
    where: {
      description: null,
      listings: { some: { available: true } },
    },
    include: {
      listings: {
        where: { available: true },
        take: 1,
        select: { id: true, url: true, shopId: true, shop: { select: { slug: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Wines missing vivinoScore:   ${missingVivino.length}`);
  console.log(`Wines missing description:   ${missingDescription.length} (with at least one available listing)\n`);

  if (args.dryRun) {
    if (missingVivino.length > 0) {
      console.log("First 5 wines missing Vivino score:");
      for (const w of missingVivino.slice(0, 5)) {
        console.log(`  ${w.id}  ${w.name}`);
      }
    }
    if (missingDescription.length > 0) {
      console.log("\nFirst 5 wines missing description:");
      for (const w of missingDescription.slice(0, 5)) {
        const listing = w.listings[0];
        console.log(`  ${w.id}  ${w.name}  (shop: ${listing?.shop.slug ?? "?"})`);
      }
    }
    console.log("\nRe-run with --vivino and/or --descriptions to enqueue jobs.");
    process.exit(0);
  }

  let enqueued = 0;

  if (args.vivino) {
    const batch = isFinite(args.limit) ? missingVivino.slice(0, args.limit) : missingVivino;
    console.log(`Enqueuing ${batch.length} ENRICH_VIVINO jobs...`);

    for (const wine of batch) {
      const jobId = await QueueClient.enqueue(
        JobType.ENRICH_VIVINO,
        { canonicalWineId: wine.id },
        { singletonKey: `vivino:${wine.id}`, retryLimit: 1 },
      );
      console.log(`  [vivino] ${wine.name} (jobId: ${jobId})`);
      enqueued++;
    }

    console.log(`\nEnqueued ${enqueued} ENRICH_VIVINO jobs.`);
  }

  if (args.descriptions) {
    const batch = isFinite(args.limit) ? missingDescription.slice(0, args.limit) : missingDescription;
    console.log(`\nEnqueuing ${batch.length} ENRICH_LISTING jobs (for missing descriptions)...`);

    let descEnqueued = 0;
    for (const wine of batch) {
      const listing = wine.listings[0];
      if (!listing) continue;

      const jobId = await QueueClient.enqueue(
        JobType.ENRICH_LISTING,
        {
          shopSlug: listing.shop.slug,
          shopId: listing.shopId,
          listingUrl: listing.url,
          canonicalWineId: wine.id,
        },
        { singletonKey: listing.url, retryLimit: 2 },
      );
      console.log(`  [desc] ${wine.name} @ ${listing.shop.slug} (jobId: ${jobId})`);
      descEnqueued++;
    }

    console.log(`\nEnqueued ${descEnqueued} ENRICH_LISTING jobs.`);
  }

  console.log("\nDone. Start the worker to process jobs: pnpm --filter web worker");
  process.exit(0);
}

main().catch((err) => {
  console.error("[enqueue-enrichment] Fatal:", err);
  process.exit(1);
});
