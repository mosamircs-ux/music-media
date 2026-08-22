import type { Project, RenderJob } from "@musicmotion/shared";

export interface RenderJobPayload {
  projectId: string;
  project: Project;
  outputKey: string;
  options?: {
    crf?: number;
    codec?: "h264" | "h265";
    concurrency?: number;
  };
}

export interface RenderJobResult {
  jobId: string;
  projectId: string;
  outputUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
}

export type RenderProgressCallback = (job: RenderJob, progressPercent: number) => Promise<void>;
