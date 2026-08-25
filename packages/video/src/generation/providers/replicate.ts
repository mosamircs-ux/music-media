import { generateId } from "@musicmotion/shared";
import type {
  VisualGenerationProvider,
  VisualGenerationRequest,
  VisualGenerationResult,
} from "@musicmotion/shared";

export interface ReplicateProviderConfig {
  apiKey: string;
  /** Replicate model ID, e.g. "stability-ai/sdxl" */
  model?: string;
  /** Request timeout in ms */
  timeoutMs?: number;
  /** Max polling attempts */
  maxPollAttempts?: number;
}

const DEFAULT_MODEL = "black-forest-labs/flux-schnell";
const DEFAULT_TIMEOUT_MS = 120_000; // 2 minutes
const DEFAULT_MAX_POLL = 40;
const POLL_INTERVAL_MS = 3000;

/**
 * ReplicateVisualGenerationProvider
 *
 * Calls the Replicate API to generate images using SDXL/Flux models.
 * Requires REPLICATE_API_KEY environment variable.
 * All secrets are server-side only — never exposed to the browser.
 */
export class ReplicateVisualGenerationProvider implements VisualGenerationProvider {
  readonly id = "replicate";
  readonly name = "Replicate (Production)";
  readonly supportsVideo = false;

  private readonly apiKey: string;
  private readonly model: string;
  private readonly timeoutMs: number;
  private readonly maxPollAttempts: number;
  private readonly activeControllers = new Map<string, AbortController>();

  constructor(config: ReplicateProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model ?? DEFAULT_MODEL;
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxPollAttempts = config.maxPollAttempts ?? DEFAULT_MAX_POLL;
  }

  async generateImage(request: VisualGenerationRequest): Promise<VisualGenerationResult> {
    const jobId = generateId();
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);
    this.activeControllers.set(jobId, controller);

    try {
      // 1. Submit prediction to Replicate
      const predictionId = await this.submitPrediction(request, controller.signal);

      // 2. Poll for completion
      const result = await this.pollUntilDone(predictionId, jobId, request, controller.signal);
      return result;
    } finally {
      clearTimeout(timeoutHandle);
      this.activeControllers.delete(jobId);
    }
  }

  async getGenerationStatus(jobId: string): Promise<VisualGenerationResult> {
    // For active jobs, status comes from polling in generateImage().
    // This method supports checking detached job IDs.
    try {
      const resp = await fetch(`https://api.replicate.com/v1/predictions/${jobId}`, {
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      if (!resp.ok) throw new Error(`Replicate status check failed: ${resp.status}`);
      const data = await resp.json() as Record<string, unknown>;
      return this.mapReplicateResponse(jobId, jobId, data);
    } catch (err) {
      return { jobId, assetId: jobId, status: "failed", progress: 0, error: String(err) };
    }
  }

  async cancelGeneration(jobId: string): Promise<{ cancelled: boolean }> {
    const controller = this.activeControllers.get(jobId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(jobId);
      return { cancelled: true };
    }

    // Try to cancel via Replicate API
    try {
      await fetch(`https://api.replicate.com/v1/predictions/${jobId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      return { cancelled: true };
    } catch {
      return { cancelled: false };
    }
  }

  // ──────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────

  private async submitPrediction(
    request: VisualGenerationRequest,
    signal: AbortSignal
  ): Promise<string> {
    const body = {
      version: this.model,
      input: {
        prompt: request.prompt,
        negative_prompt: request.negativePrompt ?? "blurry, low quality, watermark",
        width: request.width ?? 1080,
        height: request.height ?? 1920,
        num_inference_steps: request.steps ?? 4, // flux-schnell is fast at 4
        guidance_scale: request.guidanceScale ?? 0,
        seed: request.seed,
      },
    };

    let attempt = 0;
    while (attempt < 3) {
      try {
        const resp = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            Authorization: `Token ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal,
        });

        if (!resp.ok) {
          const errText = await resp.text();
          throw new Error(`Replicate submit failed [${resp.status}]: ${errText}`);
        }

        const data = await resp.json() as Record<string, unknown>;
        return data.id as string;
      } catch (err) {
        attempt++;
        if (attempt >= 3 || signal.aborted) throw err;
        await this.sleep(1000 * 2 ** attempt);
      }
    }
    throw new Error("Max retries exceeded on prediction submit");
  }

  private async pollUntilDone(
    predictionId: string,
    jobId: string,
    request: VisualGenerationRequest,
    signal: AbortSignal
  ): Promise<VisualGenerationResult> {
    const assetId = `${request.sceneId}-${jobId}`;

    for (let i = 0; i < this.maxPollAttempts; i++) {
      if (signal.aborted) {
        return { jobId, assetId, status: "cancelled", progress: 0 };
      }

      await this.sleep(POLL_INTERVAL_MS);

      const resp = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { Authorization: `Token ${this.apiKey}` },
        signal,
      });

      if (!resp.ok) continue;

      const data = await resp.json() as Record<string, unknown>;
      const result = this.mapReplicateResponse(jobId, assetId, data);

      if (result.status === "completed" || result.status === "failed") {
        return result;
      }
    }

    return { jobId, assetId: `${request.sceneId}-${jobId}`, status: "failed", progress: 0, error: "Timed out" };
  }

  private mapReplicateResponse(
    jobId: string,
    assetId: string,
    data: Record<string, unknown>
  ): VisualGenerationResult {
    const replicateStatus = data.status as string;
    const outputArr = Array.isArray(data.output) ? (data.output as string[]) : [];
    const sourceUrl = outputArr[0];

    let status: VisualGenerationResult["status"] = "processing";
    let progress = 50;

    if (replicateStatus === "succeeded") {
      status = "completed";
      progress = 100;
    } else if (replicateStatus === "failed" || replicateStatus === "canceled") {
      status = "failed";
      progress = 0;
    } else if (replicateStatus === "starting") {
      progress = 10;
    } else if (replicateStatus === "processing") {
      progress = 60;
    }

    const error = data.error ? String(data.error) : undefined;

    return {
      jobId,
      assetId,
      status,
      progress,
      sourceUrl,
      storageUrl: sourceUrl,
      previewUrl: sourceUrl,
      error,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }
}
