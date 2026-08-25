/**
 * Visual Generation Worker
 *
 * Standalone Node.js process that consumes jobs from the BullMQ
 * visual-generation queue and calls the configured provider.
 *
 * Usage:
 *   npx tsx apps/web/src/workers/visual-generation-worker.ts
 *
 * In production, run this as a separate Docker container or process.
 */
import { createVisualGenerationWorker, visualGenerationRegistry, inMemoryAssetStore } from "@musicmotion/video";

const worker = createVisualGenerationWorker(async (job) => {
  const { assetId, request } = job.data;
  const provider = visualGenerationRegistry.getProvider();

  inMemoryAssetStore.update(assetId, { status: "processing", startedAt: new Date().toISOString() });
  await job.updateProgress(10);

  try {
    const result = await provider.generateImage(request);
    await job.updateProgress(100);
    inMemoryAssetStore.update(assetId, {
      status: "completed",
      sourceUrl: result.sourceUrl,
      storageUrl: result.storageUrl,
      previewUrl: result.previewUrl,
      width: result.width,
      height: result.height,
      completedAt: new Date().toISOString(),
    });
    inMemoryAssetStore.registerJob(result.jobId, assetId);
    return {
      assetId,
      sceneId: request.sceneId,
      projectId: request.projectId,
      status: "completed" as const,
      storageUrl: result.storageUrl,
      previewUrl: result.previewUrl,
      width: result.width,
      height: result.height,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    inMemoryAssetStore.update(assetId, { status: "failed", errorMessage: errMsg, completedAt: new Date().toISOString() });
    throw err;
  }
});

worker.on("completed", (_job) => console.log("[Worker] Job completed"));
worker.on("failed", (_job, err) => console.error("[Worker] Job failed:", err.message));

console.log("[Visual Generation Worker] Started — listening for jobs...");

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
