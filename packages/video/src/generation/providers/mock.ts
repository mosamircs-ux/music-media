import { generateId } from "@musicmotion/shared";
import type {
  VisualGenerationProvider,
  VisualGenerationRequest,
  VisualGenerationResult,
} from "@musicmotion/shared";

// In-memory store for mock jobs
const mockJobs = new Map<string, VisualGenerationResult>();

/**
 * MockVisualGenerationProvider
 *
 * Used in development (VISUAL_PROVIDER=mock). Generates a deterministic
 * colored SVG placeholder image synchronously with a small artificial delay.
 * No external calls. No API keys needed.
 */
export class MockVisualGenerationProvider implements VisualGenerationProvider {
  readonly id = "mock";
  readonly name = "Mock (Development)";
  readonly supportsVideo = false;

  /** Simulated latency in ms */
  private readonly delayMs: number;

  constructor(delayMs = 800) {
    this.delayMs = delayMs;
  }

  async generateImage(request: VisualGenerationRequest): Promise<VisualGenerationResult> {
    await this.sleep(this.delayMs);

    const jobId = generateId();
    const assetId = request.sceneId + "-" + jobId;

    // Generate a deterministic hue from the prompt text
    const hue = this.promptToHue(request.prompt);
    const svgUrl = this.buildSvgDataUrl(request.prompt, hue, request.width ?? 1080, request.height ?? 1920);

    const result: VisualGenerationResult = {
      jobId,
      assetId,
      status: "completed",
      progress: 100,
      sourceUrl: svgUrl,
      storageUrl: svgUrl,
      previewUrl: svgUrl,
      width: request.width ?? 1080,
      height: request.height ?? 1920,
    };

    mockJobs.set(jobId, result);
    return result;
  }

  async getGenerationStatus(jobId: string): Promise<VisualGenerationResult> {
    const job = mockJobs.get(jobId);
    if (!job) {
      return {
        jobId,
        assetId: "",
        status: "failed",
        progress: 0,
        error: "Job not found",
      };
    }
    return job;
  }

  async cancelGeneration(jobId: string): Promise<{ cancelled: boolean }> {
    const job = mockJobs.get(jobId);
    if (job && job.status === "processing") {
      mockJobs.set(jobId, { ...job, status: "cancelled", progress: 0 });
      return { cancelled: true };
    }
    return { cancelled: false };
  }

  // ──────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────

  private sleep(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
  }

  private promptToHue(prompt: string): number {
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = (hash << 5) - hash + prompt.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 360;
  }

  private buildSvgDataUrl(prompt: string, hue: number, width: number, height: number): string {
    const bg = `hsl(${hue}, 60%, 12%)`;
    const accent = `hsl(${(hue + 60) % 360}, 80%, 55%)`;
    const labelText = prompt.length > 45 ? prompt.slice(0, 42) + "..." : prompt;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${bg}"/>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <text x="50%" y="47%" text-anchor="middle" font-family="sans-serif" font-size="48" fill="${accent}" opacity="0.9">🎬</text>
  <text x="50%" y="53%" text-anchor="middle" font-family="sans-serif" font-size="28" fill="white" opacity="0.7">${labelText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
  <text x="50%" y="57%" text-anchor="middle" font-family="sans-serif" font-size="18" fill="${accent}" opacity="0.5">Mock Visual · MusicMotion</text>
</svg>`;

    const b64 = Buffer.from(svg).toString("base64");
    return `data:image/svg+xml;base64,${b64}`;
  }
}
