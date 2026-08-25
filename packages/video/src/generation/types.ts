import type { VisualGenerationRequest, VisualGenerationResult, AssetStatus } from "@musicmotion/shared";

/**
 * Payload stored in BullMQ for each visual generation job.
 */
export interface VisualGenerationJob {
  assetId: string;
  request: VisualGenerationRequest;
  providerOverride?: string;
  creditCost: number;
  retryCount?: number;
}

export type { VisualGenerationResult, AssetStatus };

export interface VisualWorkerResult {
  assetId: string;
  sceneId: string;
  projectId: string;
  status: AssetStatus;
  storageUrl?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}
