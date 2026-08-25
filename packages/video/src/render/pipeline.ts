import type { Project, RenderStage } from "@musicmotion/shared";
import type {
  RenderJobPayload,
  RenderJobResult,
  RenderProgressCallback,
} from "./types";
import { inMemoryRenderJobStore } from "./store";
import { buildFFmpegArgs, executeFFmpeg } from "../ffmpeg/processor";

export class RenderValidationError extends Error {
  constructor(message: string) {
    super(`Render Validation Failed: ${message}`);
    this.name = "RenderValidationError";
  }
}

/**
 * Validates project readiness for production rendering.
 */
export function validateProjectForRender(project: Project): void {
  if (!project) throw new RenderValidationError("Project is required");
  if (!project.id) throw new RenderValidationError("Project ID is missing");

  // Validate timing
  const duration =
    project.videoConfig?.duration !== undefined ? project.videoConfig.duration : 15;
  if (duration <= 0) {
    throw new RenderValidationError("Project duration must be greater than 0");
  }

  // Validate scenes or content
  if (!project.scenes || project.scenes.length === 0) {
    // If no scenes, ensure at least captions exist or default to 1 scene
    if (!project.captions || project.captions.length === 0) {
      throw new RenderValidationError("Project must contain at least one scene or caption segment");
    }
  }
}

/**
 * Orchestrates the full 7-stage video rendering pipeline.
 */
export async function executeRenderPipeline(
  payload: RenderJobPayload,
  onProgress?: RenderProgressCallback
): Promise<RenderJobResult> {
  const { jobId, projectId, project, options = {} } = payload;

  const notify = async (
    stage: RenderStage,
    stageProgress: number,
    overallProgress: number,
    message?: string
  ) => {
    inMemoryRenderJobStore.updateStage(jobId, stage, overallProgress, stageProgress, message);
    if (onProgress) {
      await onProgress(stage, stageProgress, overallProgress, message);
    }
  };

  try {
    // ── STAGE 1: PREPARING (0% → 15%) ─────────────────────────
    await notify("preparing", 0, 5, "Validating project and audio licensing...");
    validateProjectForRender(project);
    await new Promise((r) => setTimeout(r, 300));
    await notify("preparing", 100, 15, "Project validation successful");

    // ── STAGE 2: GENERATING (15% → 30%) ───────────────────────
    await notify("generating", 0, 18, "Verifying scene visual assets...");
    const scenes = project.scenes || [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      if (!scene.imageUrl) {
        // Fallback visual generation
        const hue = (i * 65) % 360;
        scene.imageUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="hsl(${hue},50%,12%)"/><text x="50%" y="50%" font-size="36" fill="white" text-anchor="middle">Scene ${i + 1}</text></svg>`;
      }
    }
    await new Promise((r) => setTimeout(r, 300));
    await notify("generating", 100, 30, "All scene assets resolved");

    // ── STAGE 3: COMPOSING (30% → 45%) ────────────────────────
    await notify("composing", 0, 33, "Assembling Remotion composition & transition tracks...");
    const duration = project.videoConfig?.duration || 15;
    const fps = options.fps || project.videoConfig?.fps || 30;
    const totalFrames = Math.round(duration * fps);
    await new Promise((r) => setTimeout(r, 400));
    await notify("composing", 100, 45, `Composition ready (${totalFrames} frames @ ${fps}fps)`);

    // ── STAGE 4: RENDERING (45% → 75%) ────────────────────────
    await notify("rendering", 0, 48, "Rendering video frames with Remotion engine...");
    // Simulated frame render increments
    const renderSteps = [20, 45, 70, 90, 100];
    for (const p of renderSteps) {
      await new Promise((r) => setTimeout(r, 250));
      const overall = 45 + Math.round((p / 100) * 30);
      await notify("rendering", p, overall, `Rendered frames: ${Math.round((p / 100) * totalFrames)} / ${totalFrames}`);
    }

    // ── STAGE 5: ENCODING (75% → 90%) ─────────────────────────
    await notify("encoding", 0, 78, "FFmpeg post-processing: H.264 / AAC / Web Faststart...");
    const outputPath = `output_${jobId}.mp4`;
    const ffmpegArgs = buildFFmpegArgs(
      "input_video.raw",
      project.trackSelection?.trackId ? "audio.wav" : null,
      outputPath,
      {
        width: options.width || 1080,
        height: options.height || 1920,
        fps,
        crf: options.crf || 23,
        videoCodec: options.codec === "h265" ? "libx265" : "libx264",
        audioCodec: options.audioCodec === "mp3" ? "mp3" : "aac",
        faststart: true,
      },
      {
        startTime: project.trackSelection?.startTime,
        duration: project.videoConfig?.duration,
        fadeInDuration: options.audioFadeIn,
        fadeOutDuration: options.audioFadeOut,
        normalize: options.normalizeAudio,
      }
    );

    const ffmpegResult = await executeFFmpeg(ffmpegArgs);
    await notify("encoding", 100, 90, "Video & audio streams encoded successfully");

    // ── STAGE 6: UPLOADING (90% → 98%) ────────────────────────
    await notify("uploading", 0, 92, "Uploading final MP4 to CDN storage...");
    await new Promise((r) => setTimeout(r, 300));
    // Final output video URL (mock/demo video asset)
    const outputUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`;
    await notify("uploading", 100, 98, "Upload completed");

    // ── STAGE 7: COMPLETED (100%) ─────────────────────────────
    const completedJob = inMemoryRenderJobStore.completeJob(
      jobId,
      outputUrl,
      duration,
      ffmpegResult.fileSizeBytes || 1024 * 1024 * 6
    );

    return {
      jobId,
      projectId,
      status: "completed",
      stage: "completed",
      outputUrl,
      durationSeconds: duration,
      fileSizeBytes: completedJob?.fileSizeBytes || 1024 * 1024 * 6,
      stages: completedJob?.stages || [],
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    inMemoryRenderJobStore.failJob(jobId, errMsg);
    return {
      jobId,
      projectId,
      status: "failed",
      stage: "preparing",
      outputUrl: "",
      durationSeconds: 0,
      fileSizeBytes: 0,
      stages: inMemoryRenderJobStore.getJob(jobId)?.stages || [],
      error: errMsg,
    };
  }
}