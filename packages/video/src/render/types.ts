import type {
  Project,
  RenderStage,
  RenderJobStatus,
  RenderStageInfo,
} from "@musicmotion/shared";

export interface RenderPipelineOptions {
  width?: number;
  height?: number;
  fps?: number;
  crf?: number;
  codec?: "h264" | "h265";
  audioCodec?: "aac" | "mp3";
  audioFadeIn?: number;
  audioFadeOut?: number;
  normalizeAudio?: boolean;
  watermarkText?: string;
  concurrency?: number;
}

export interface RenderJobPayload {
  jobId: string;
  projectId: string;
  project: Project;
  outputKey?: string;
  options?: RenderPipelineOptions;
}

export interface RenderJobResult {
  jobId: string;
  projectId: string;
  status: RenderJobStatus;
  stage: RenderStage;
  outputUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  stages: RenderStageInfo[];
  error?: string;
}

export type RenderProgressCallback = (
  stage: RenderStage,
  stageProgress: number,
  overallProgress: number,
  message?: string
) => Promise<void> | void;