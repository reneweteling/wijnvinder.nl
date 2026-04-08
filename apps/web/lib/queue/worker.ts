#!/usr/bin/env node

import { getWorkerClient, shutdownQueue } from "./config";
import { processors } from "./processors";
import { JobType, jobSchemas } from "./types";

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

    await boss.work(
      jobType,
      { batchSize: 10, pollingIntervalSeconds: 2 },
      async (jobs) => {
        await Promise.all(jobs.map(async (job) => {
          console.log(`[worker: ${jobType}] Processing job ${job.id}`);
          try {
            const schema = jobSchemas[jobType as JobType];
            const data = schema.parse(job.data);
            await (processor as (job: { id: string; data: unknown }) => Promise<unknown>)({ id: job.id, data });
            console.log(`[worker: ${jobType}] Job ${job.id}: completed`);
          } catch (error) {
            console.error(
              `[worker: ${jobType}] Job ${job.id} failed:`,
              error,
            );
            throw error;
          }
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
