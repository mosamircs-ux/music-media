import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  visualGenerationRegistry,
  inMemoryAssetStore,
  checkRateLimit,
  RateLimitError,
} from "@musicmotion/video";

export const runtime = "nodejs";

const SceneGenerationItemSchema = z.object({
  sceneId: z.string().min(1),
  prompt: z.string().min(1).max(2000),
  negativePrompt: z.string().max(500).optional(),
  visualStyle: z.string().optional(),
  width: z.number().int().min(256).max(4096).optional().default(1080),
  height: z.number().int().min(256).max(4096).optional().default(1920),
});

const RequestBodySchema = z.object({
  projectId: z.string().min(1),
  scenes: z.array(SceneGenerationItemSchema).min(1).max(20),
});

/**
 * POST /api/generate/scene
 *
 * Submits one or more scenes for visual image generation.
 * Applies rate limiting and duplicate-job guard per scene.
 * Returns the job IDs for progress polling.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const { projectId, scenes } = parsed.data;

    // 1. Rate limit check (per project)
    try {
      checkRateLimit(projectId);
    } catch (err) {
      if (err instanceof RateLimitError) {
        return NextResponse.json({ error: err.message }, { status: 429 });
      }
      throw err;
    }

    const provider = visualGenerationRegistry.getProvider();
    const results: Array<{ sceneId: string; jobId: string; assetId: string; isDuplicate: boolean }> = [];

    for (const scene of scenes) {
      // 2. Duplicate guard — return existing pending job instead of creating a new one
      const existing = inMemoryAssetStore.findPendingForScene(scene.sceneId);
      if (existing) {
        const existingJobId = Array.from(
          (inMemoryAssetStore as unknown as { jobToAsset: Map<string, string> })["jobToAsset"]
        ).find(([, assetId]) => assetId === existing.id)?.[0] ?? existing.id;

        results.push({ sceneId: scene.sceneId, jobId: existingJobId, assetId: existing.id, isDuplicate: true });
        continue;
      }

      // 3. Create asset record (queued)
      const asset = inMemoryAssetStore.create({
        projectId,
        sceneId: scene.sceneId,
        provider: provider.id,
        type: "image",
        prompt: scene.prompt,
        negativePrompt: scene.negativePrompt,
        status: "queued",
        creditCost: 1,
      });

      // 4. Generate (async — mock is fast; real providers use BullMQ workers)
      // We start the generation promise but don't await it — update store when done
      const request_: import("@musicmotion/shared").VisualGenerationRequest = {
        sceneId: scene.sceneId,
        projectId,
        prompt: scene.prompt,
        negativePrompt: scene.negativePrompt,
        visualStyle: scene.visualStyle,
        width: scene.width,
        height: scene.height,
      };

      // Update to processing
      inMemoryAssetStore.update(asset.id, { status: "processing", startedAt: new Date().toISOString() });

      // Fire-and-forget generation
      provider
        .generateImage(request_)
        .then((result) => {
          inMemoryAssetStore.update(asset.id, {
            status: result.status,
            sourceUrl: result.sourceUrl,
            storageUrl: result.storageUrl,
            previewUrl: result.previewUrl,
            width: result.width,
            height: result.height,
            completedAt: new Date().toISOString(),
          });
          inMemoryAssetStore.registerJob(result.jobId, asset.id);
          // Keep a cross-ref with the initial assetId too
          inMemoryAssetStore.registerJob(asset.id, asset.id);
        })
        .catch((err: Error) => {
          inMemoryAssetStore.update(asset.id, {
            status: "failed",
            errorMessage: err.message,
            completedAt: new Date().toISOString(),
          });
        });

      // Register provisional mapping so status endpoint can find the asset
      inMemoryAssetStore.registerJob(asset.id, asset.id);
      results.push({ sceneId: scene.sceneId, jobId: asset.id, assetId: asset.id, isDuplicate: false });
    }

    return NextResponse.json({ success: true, jobs: results });
  } catch (error) {
    console.error("Scene generation request failed:", error);
    return NextResponse.json(
      { error: "Generation request failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
