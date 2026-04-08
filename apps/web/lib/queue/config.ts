import { PgBoss } from "pg-boss";

let enqueueClient: PgBoss | null = null;
let workerClient: PgBoss | null = null;

function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for pg-boss.");
  }
  return {
    connectionString,
    schema: "pgboss" as const,
    ...(connectionString.includes("localhost")
      ? {}
      : { ssl: { rejectUnauthorized: false } }),
  };
}

/**
 * Get pg-boss client for enqueuing jobs only (web app context).
 */
export async function getEnqueueClient(): Promise<PgBoss> {
  if (enqueueClient) return enqueueClient;

  enqueueClient = new PgBoss({
    ...getConnectionConfig(),
    supervise: false,
    schedule: false,
  });

  await enqueueClient.start();
  return enqueueClient;
}

/**
 * Get pg-boss client for the worker process (full supervisor).
 */
export async function getWorkerClient(): Promise<PgBoss> {
  if (workerClient) return workerClient;

  workerClient = new PgBoss(getConnectionConfig());

  await workerClient.start();
  return workerClient;
}

export async function shutdownQueue(): Promise<void> {
  if (enqueueClient) {
    await enqueueClient.stop();
    enqueueClient = null;
  }
  if (workerClient) {
    await workerClient.stop();
    workerClient = null;
  }
}
