#!/usr/bin/env node

import { Sentry } from "./instrument";
import { getWorkerClient, shutdownQueue } from "./config";
import { processors } from "./processors";
import { JobType, jobSchemas } from "./types";

// Every Friday at 16:00 Europe/Amsterdam
const WEEKLY_DEALS_CRON = "0 16 * * 5";

// Every night at 03:00 Europe/Amsterdam
const NIGHTLY_SCRAPE_CRON = "0 3 * * *";

// Allow parallel enrichment fetches (different domains), keep other queues sequential
const WORKER_OPTIONS: Partial<Record<JobType, { batchSize: number; localConcurrency: number }>> = {
  [JobType.ENRICH_LISTING]: { batchSize: 25, localConcurrency: 25 },
};

async function startWorker() {
  console.log("[worker] Starting queue worker...");

  const boss = await getWorkerClient();

  for (const [jobType, processor] of Object.entries(processors)) {
    try {
      await boss.createQueue(jobType);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "42P07") throw error;
    }

    const opts = WORKER_OPTIONS[jobType as JobType];

    await boss.work(
      jobType,
      { pollingIntervalSeconds: 2, ...opts },
      async (jobs) => {
        await Promise.all(jobs.map(async (job) => {
          console.log(`[worker: ${jobType}] Processing job ${job.id}`);
          const schema = jobSchemas[jobType as JobType];
          const data = schema.parse(job.data);
          try {
            await (processor as (job: { id: string; data: unknown }) => Promise<unknown>)({ id: job.id, data });
          } catch (error) {
            Sentry.captureException(error, { tags: { jobType }, extra: { jobId: job.id } });
            throw error;
          }
          console.log(`[worker: ${jobType}] Job ${job.id}: completed`);
        }));
      },
    );

    console.log(`[worker: ${jobType}] Registered with boss.work()`);
  }

  // Schedule weekly deals email every Friday at 16:00 Europe/Amsterdam.
  // Wrapped in try/catch because pg-boss throws when a schedule with the same name
  // already exists in the database (e.g. on worker restart without a clean shutdown).
  try {
    await boss.schedule(
      JobType.WEEKLY_DEALS_EMAIL,
      WEEKLY_DEALS_CRON,
      {},
      { tz: "Europe/Amsterdam" },
    );
    console.log(
      `[worker] Scheduled ${JobType.WEEKLY_DEALS_EMAIL} (${WEEKLY_DEALS_CRON} Europe/Amsterdam)`,
    );
  } catch (error) {
    console.warn(
      `[worker] Could not register schedule for ${JobType.WEEKLY_DEALS_EMAIL} (may already exist):`,
      error,
    );
  }

  // Schedule nightly scrape every night at 03:00 Europe/Amsterdam.
  // Same guard as above: pg-boss throws when the schedule already exists.
  try {
    await boss.schedule(
      JobType.NIGHTLY_SCRAPE,
      NIGHTLY_SCRAPE_CRON,
      {},
      { tz: "Europe/Amsterdam" },
    );
    console.log(
      `[worker] Scheduled ${JobType.NIGHTLY_SCRAPE} (${NIGHTLY_SCRAPE_CRON} Europe/Amsterdam)`,
    );
  } catch (error) {
    console.warn(
      `[worker] Could not register schedule for ${JobType.NIGHTLY_SCRAPE} (may already exist):`,
      error,
    );
  }

  console.log("[worker] Queue worker started. Listening for jobs...");

  const shutdown = async () => {
    console.log("[worker] Shutting down...");
    await shutdownQueue();
    await Sentry.flush(2000);
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startWorker().catch(async (error) => {
  console.error("[worker] Failed to start worker:", error);
  Sentry.captureException(error);
  await Sentry.flush(2000);
  process.exit(1);
});
