#!/usr/bin/env node

import { getWorkerClient, shutdownQueue } from "./config";
import { processors } from "./processors";
import { JobType, jobSchemas } from "./types";

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
          await (processor as (job: { id: string; data: unknown }) => Promise<unknown>)({ id: job.id, data });
          console.log(`[worker: ${jobType}] Job ${job.id}: completed`);
        }));
      },
    );

    console.log(`[worker: ${jobType}] Registered with boss.work()`);
  }

  console.log("[worker] Queue worker started. Listening for jobs...");

  const shutdown = async () => {
    console.log("[worker] Shutting down...");
    await shutdownQueue();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startWorker().catch((error) => {
  console.error("[worker] Failed to start worker:", error);
  process.exit(1);
});
