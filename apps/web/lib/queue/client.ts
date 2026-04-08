import { getEnqueueClient } from "./config";
import { JobType, jobSchemas } from "./types";
import type { JobOptions, JobPayload } from "./types";

export class QueueClient {
  static async enqueue<T extends JobType>(
    jobType: T,
    data: JobPayload<T>,
    options?: JobOptions,
  ): Promise<string | null> {
    const schema = jobSchemas[jobType];
    const validated = schema.parse(data) as object;

    const boss = await getEnqueueClient();

    try {
      await boss.createQueue(jobType);
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "42P07") throw error;
    }

    const sendOptions: Record<string, unknown> = {};
    if (options?.startAfter != null) sendOptions.startAfter = options.startAfter;
    if (options?.priority != null) sendOptions.priority = options.priority;
    if (options?.retryLimit != null) sendOptions.retryLimit = options.retryLimit;
    if (options?.retryDelay != null) sendOptions.retryDelay = options.retryDelay;
    if (options?.expireInSeconds != null)
      sendOptions.expireInSeconds = options.expireInSeconds;

    return boss.send(jobType, validated, sendOptions);
  }
}
