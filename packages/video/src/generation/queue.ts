import { Queue, Worker, type Job } from "bullmq";
import Redis from "ioredis";
import type { VisualGenerationJob, VisualWorkerResult } from "./types";

export const VISUAL_GENERATION_QUEUE_NAME = "musicmotion-visual-generation";

function getRedisConnection(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

/**
 * Creates a BullMQ Queue for visual generation jobs.
 * Jobs are retry-able (up to 3 attempts) with exponential backoff.
 */
export function createVisualGenerationQueue(): Queue<VisualGenerationJob, VisualWorkerResult> {
  const connection = getRedisConnection();
  return new Queue<VisualGenerationJob, VisualWorkerResult>(VISUAL_GENERATION_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600 * 24, // keep for 24h
        count: 500,
      },
      removeOnFail: {
        age: 3600 * 24 * 7, // keep failed for 7 days
      },
    },
  });
}

/**
 * Creates a BullMQ Worker that processes visual generation jobs.
 * The processor function receives a job, calls the appropriate provider,
 * and returns a VisualWorkerResult.
 */
export function createVisualGenerationWorker(
  processor: (job: Job<VisualGenerationJob, VisualWorkerResult>) => Promise<VisualWorkerResult>,
  concurrency = Number(process.env.WORKER_CONCURRENCY) || 2
): Worker<VisualGenerationJob, VisualWorkerResult> {
  const connection = getRedisConnection();
  return new Worker<VisualGenerationJob, VisualWorkerResult>(
    VISUAL_GENERATION_QUEUE_NAME,
    processor,
    {
      connection,
      concurrency,
      lockDuration: 300_000, // 5 minutes
    }
  );
}
