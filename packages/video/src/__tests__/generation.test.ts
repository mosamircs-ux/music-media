import { describe, it, expect, beforeEach } from "vitest";
import { MockVisualGenerationProvider } from "../generation/providers/mock";
import { inMemoryAssetStore } from "../generation/in-memory-store";
import {
  checkRateLimit,
  getRateLimitCount,
  resetRateLimit,
  RateLimitError,
} from "../generation/rate-limit";

// ── MockVisualGenerationProvider ──────────────────────────────

describe("MockVisualGenerationProvider", () => {
  const provider = new MockVisualGenerationProvider(0); // 0ms delay for tests

  it("should have correct metadata", () => {
    expect(provider.id).toBe("mock");
    expect(provider.supportsVideo).toBe(false);
  });

  it("generateImage returns completed status with preview URL", async () => {
    const result = await provider.generateImage({
      sceneId: "scene-1",
      projectId: "proj-1",
      prompt: "A cinematic night cityscape",
    });

    expect(result.status).toBe("completed");
    expect(result.progress).toBe(100);
    expect(result.previewUrl).toBeTruthy();
    expect(result.previewUrl).toContain("data:image/svg+xml;base64,");
    expect(result.jobId).toBeTruthy();
    expect(result.assetId).toBeTruthy();
  });

  it("generateImage produces different SVGs for different prompts", async () => {
    const r1 = await provider.generateImage({ sceneId: "s1", projectId: "p1", prompt: "Sunset over ocean" });
    const r2 = await provider.generateImage({ sceneId: "s2", projectId: "p1", prompt: "Dark forest midnight" });
    expect(r1.previewUrl).not.toBe(r2.previewUrl);
  });

  it("getGenerationStatus returns the stored job", async () => {
    const gen = await provider.generateImage({ sceneId: "s3", projectId: "p1", prompt: "Mountains" });
    const status = await provider.getGenerationStatus(gen.jobId);
    expect(status.status).toBe("completed");
    expect(status.jobId).toBe(gen.jobId);
  });

  it("getGenerationStatus returns failed for unknown jobId", async () => {
    const status = await provider.getGenerationStatus("nonexistent-job-id");
    expect(status.status).toBe("failed");
  });

  it("cancelGeneration returns false for completed jobs", async () => {
    const gen = await provider.generateImage({ sceneId: "s4", projectId: "p1", prompt: "Test" });
    const result = await provider.cancelGeneration(gen.jobId);
    // Completed jobs can't be cancelled
    expect(result.cancelled).toBe(false);
  });
});

// ── InMemoryAssetStore ─────────────────────────────────────────

describe("InMemoryAssetStore", () => {
  beforeEach(() => {
    inMemoryAssetStore.clear();
  });

  it("creates and retrieves assets by id", () => {
    const asset = inMemoryAssetStore.create({
      projectId: "proj-1",
      sceneId: "scene-1",
      provider: "mock",
      type: "image",
      prompt: "Test prompt",
      status: "queued",
    });

    expect(asset.id).toBeTruthy();
    expect(asset.status).toBe("queued");
    expect(inMemoryAssetStore.get(asset.id)).toEqual(asset);
  });

  it("updates asset status", () => {
    const asset = inMemoryAssetStore.create({
      projectId: "proj-1",
      sceneId: "scene-1",
      provider: "mock",
      type: "image",
      prompt: "Test",
      status: "queued",
    });

    const updated = inMemoryAssetStore.update(asset.id, { status: "completed", storageUrl: "https://example.com/img.svg" });
    expect(updated?.status).toBe("completed");
    expect(updated?.storageUrl).toBe("https://example.com/img.svg");
  });

  it("registers and retrieves job → asset mapping", () => {
    const asset = inMemoryAssetStore.create({
      projectId: "proj-1",
      sceneId: "scene-2",
      provider: "mock",
      type: "image",
      prompt: "Sky",
      status: "queued",
    });
    inMemoryAssetStore.registerJob("job-abc", asset.id);
    expect(inMemoryAssetStore.getAssetIdByJob("job-abc")).toBe(asset.id);
  });

  it("findPendingForScene returns null when no pending jobs", () => {
    const asset = inMemoryAssetStore.create({
      projectId: "proj-1",
      sceneId: "scene-3",
      provider: "mock",
      type: "image",
      prompt: "Test",
      status: "completed",
    });
    expect(inMemoryAssetStore.findPendingForScene(asset.sceneId)).toBeNull();
  });

  it("findPendingForScene returns pending job when one exists", () => {
    const asset = inMemoryAssetStore.create({
      projectId: "proj-1",
      sceneId: "scene-4",
      provider: "mock",
      type: "image",
      prompt: "Test",
      status: "queued",
    });
    const found = inMemoryAssetStore.findPendingForScene("scene-4");
    expect(found?.id).toBe(asset.id);
  });
});

// ── Rate Limiter ───────────────────────────────────────────────

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimit("proj-test");
  });

  it("allows requests within limit", () => {
    // Default limit is 10 per minute
    for (let i = 0; i < 10; i++) {
      expect(() => checkRateLimit("proj-test")).not.toThrow();
    }
    expect(getRateLimitCount("proj-test")).toBe(10);
  });

  it("throws RateLimitError when limit is exceeded", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("proj-test");
    }
    expect(() => checkRateLimit("proj-test")).toThrow(RateLimitError);
  });

  it("isolates rate limits by key", () => {
    resetRateLimit("proj-A");
    resetRateLimit("proj-B");
    for (let i = 0; i < 10; i++) checkRateLimit("proj-A");
    // proj-B should be unaffected
    expect(() => checkRateLimit("proj-B")).not.toThrow();
    // proj-A should be at limit
    expect(() => checkRateLimit("proj-A")).toThrow(RateLimitError);
  });
});