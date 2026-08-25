import { generateId } from "@musicmotion/shared";
import type {
  RenderJob,
  RenderStage,
  RenderStageInfo,
  RenderProgressInfo,
} from "@musicmotion/shared";

const DEFAULT_STAGES: Array<{ stage: RenderStage; label: string }> = [
  { stage: "preparing", label: "Preparing project & validating audio" },
  { stage: "generating", label: "Resolving & generating scene visuals" },
  { stage: "composing", label: "Composing video timeline & transitions" },
  { stage: "rendering", label: "Rendering video frames" },
  { stage: "encoding", label: "FFmpeg encoding (H.264 / AAC / Faststart)" },
  { stage: "uploading", label: "Uploading video to storage" },
  { stage: "completed", label: "Ready for playback" },
];

export function createInitialStages(): RenderStageInfo[] {
  return DEFAULT_STAGES.map((s, idx) => ({
    stage: s.stage,
    label: s.label,
    status: idx === 0 ? "active" : "pending",
    progress: idx === 0 ? 0 : undefined,
  }));
}

/**
 * InMemoryRenderJobStore
 *
 * Manages active and completed video render jobs in development mode,
 * tracking stage transitions, percentages, and cancellation.
 */
class InMemoryRenderJobStoreClass {
  private jobs = new Map<string, RenderJob>();

  createJob(projectId: string, customJobId?: string): RenderJob {
    const id = customJobId || generateId();
    const now = new Date().toISOString();

    const job: RenderJob = {
      id,
      projectId,
      status: "queued",
      stage: "preparing",
      progress: 0,
      stages: createInitialStages(),
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, job);
    return job;
  }

  getJob(id: string): RenderJob | null {
    return this.jobs.get(id) ?? null;
  }

  getJobsByProject(projectId: string): RenderJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.projectId === projectId);
  }

  updateStage(
    id: string,
    currentStage: RenderStage,
    overallProgress: number,
    stageProgress?: number,
    message?: string
  ): RenderJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    const stages = job.stages ? [...job.stages] : createInitialStages();
    let passedCurrent = false;

    const updatedStages = stages.map((s) => {
      if (s.stage === currentStage) {
        passedCurrent = true;
        return {
          ...s,
          status: "active" as const,
          progress: stageProgress !== undefined ? stageProgress : s.progress,
          message: message ?? s.message,
        };
      }
      if (!passedCurrent) {
        return {
          ...s,
          status: "completed" as const,
          progress: 100,
        };
      }
      return {
        ...s,
        status: "pending" as const,
      };
    });

    const updated: RenderJob = {
      ...job,
      status: currentStage === "completed" ? "completed" : "rendering",
      stage: currentStage,
      progress: Math.min(100, Math.max(0, overallProgress)),
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    };

    if (currentStage === "completed") {
      updated.completedAt = new Date().toISOString();
    }

    this.jobs.set(id, updated);
    return updated;
  }

  completeJob(
    id: string,
    outputUrl: string,
    durationSeconds = 15,
    fileSizeBytes = 1024 * 1024 * 5
  ): RenderJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    const stages = (job.stages || createInitialStages()).map((s) => ({
      ...s,
      status: "completed" as const,
      progress: 100,
    }));

    const now = new Date().toISOString();
    const updated: RenderJob = {
      ...job,
      status: "completed",
      stage: "completed",
      progress: 100,
      stages,
      outputUrl,
      durationSeconds,
      fileSizeBytes,
      completedAt: now,
      updatedAt: now,
    };

    this.jobs.set(id, updated);
    return updated;
  }

  failJob(id: string, error: string): RenderJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    const stages = (job.stages || createInitialStages()).map((s) => {
      if (s.stage === job.stage) {
        return { ...s, status: "failed" as const, message: error };
      }
      return s;
    });

    const updated: RenderJob = {
      ...job,
      status: "failed",
      error,
      stages,
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(id, updated);
    return updated;
  }

  cancelJob(id: string): RenderJob | null {
    const job = this.jobs.get(id);
    if (!job) return null;
    if (job.status === "completed" || job.status === "cancelled") return job;

    const updated: RenderJob = {
      ...job,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(id, updated);
    return updated;
  }

  toProgressInfo(job: RenderJob): RenderProgressInfo {
    return {
      jobId: job.id,
      projectId: job.projectId,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      stages: job.stages || createInitialStages(),
      outputUrl: job.outputUrl,
      error: job.error,
      durationSeconds: job.durationSeconds,
      fileSizeBytes: job.fileSizeBytes,
      updatedAt: job.updatedAt,
    };
  }

  clear(): void {
    this.jobs.clear();
  }
}

export const inMemoryRenderJobStore = new InMemoryRenderJobStoreClass();