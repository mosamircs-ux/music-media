import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  inMemoryRenderJobStore,
  executeRenderPipeline,
  validateProjectForRender,
  RenderValidationError,
} from "@musicmotion/video";
import { generateId, type Project } from "@musicmotion/shared";

export const runtime = "nodejs";

const RenderRequestSchema = z.object({
  projectId: z.string().min(1),
  project: z.any().optional(),
  options: z
    .object({
      width: z.number().int().min(256).max(3840).optional(),
      height: z.number().int().min(256).max(3840).optional(),
      fps: z.number().int().min(15).max(60).optional(),
      crf: z.number().int().min(0).max(51).optional(),
      codec: z.enum(["h264", "h265"]).optional(),
      audioCodec: z.enum(["aac", "mp3"]).optional(),
      audioFadeIn: z.number().min(0).max(10).optional(),
      audioFadeOut: z.number().min(0).max(10).optional(),
      normalizeAudio: z.boolean().optional(),
      watermarkText: z.string().max(50).optional(),
    })
    .optional(),
});

/**
 * POST /api/render
 *
 * Enqueues a non-blocking video rendering job across the 7-stage pipeline.
 * Returns immediately with the jobId for real-time progress polling.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RenderRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid render request payload",
          details: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const { projectId, options } = parsed.data;

    // Resolve or construct project object
    const project: Project = parsed.data.project || {
      id: projectId,
      title: "Untitled Story",
      status: "ready",
      locale: "en",
      captions: [],
      scenes: [],
      videoConfig: {
        width: options?.width || 1080,
        height: options?.height || 1920,
        fps: options?.fps || 30,
        aspectRatio: "9:16",
        duration: 15,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Validate project readiness
    try {
      validateProjectForRender(project);
    } catch (err) {
      if (err instanceof RenderValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    // 2. Create RenderJob record
    const jobId = generateId();
    const job = inMemoryRenderJobStore.createJob(projectId, jobId);

    // 3. Launch rendering pipeline in background (non-blocking)
    executeRenderPipeline({
      jobId,
      projectId,
      project,
      options,
    }).catch((err) => {
      console.error(`[RenderPipeline] Background render job ${jobId} failed:`, err);
    });

    return NextResponse.json({
      success: true,
      jobId: job.id,
      job: inMemoryRenderJobStore.toProgressInfo(job),
      message: "Render job queued successfully in background",
    });
  } catch (error) {
    console.error("Failed to schedule render job:", error);
    return NextResponse.json(
      { error: "Failed to schedule render job", message: (error as Error).message },
      { status: 500 }
    );
  }
}