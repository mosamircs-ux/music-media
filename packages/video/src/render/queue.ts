import { Queue, Worker, type Job } from "bullmq";
import Redis from "ioredis";
import type { RenderJobPayload, RenderJobResult } from "./types";

export const RENDER_QUEUE_NAME = "musicmotion-video-render";

function getRedisConnection(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  });
}

/**
 * Creates BullMQ Queue instance for enqueueing video render jobs
 */
export function createRenderQueue(): Queue<RenderJobPayload, RenderJobResult> {
  const connection = getRedisConnection();
  return new Queue<RenderJobPayload, RenderJobResult>(RENDER_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 3600 * 24, // keep completed jobs for 24h
        count: 1000,
      },
      removeOnFail: {
        age: 3600 * 24 * 7, // keep failed jobs for 7 days
      },
    },
  });
}

/**
 * Creates a BullMQ Worker instance for executing render jobs with FFmpeg / Remotion
 */
export function createRenderWorker(
  processor: (job: Job<RenderJobPayload, RenderJobResult>) => Promise<RenderJobResult>,
  concurrency = Number(process.env.WORKER_CONCURRENCY) || 2
): Worker<RenderJobPayload, RenderJobResult> {
  const connection = getRedisConnection();
  return new Worker<RenderJobPayload, RenderJobResult>(
    RENDER_QUEUE_NAME,
    processor,
    {
      connection,
      concurrency,
      lockDuration: 300000, // 5 minutes lock
    }
  );
}
