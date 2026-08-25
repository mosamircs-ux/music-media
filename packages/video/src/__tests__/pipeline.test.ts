import { describe, it, expect, beforeEach } from "vitest";
import {
  validateProjectForRender,
  executeRenderPipeline,
  RenderValidationError,
} from "../render/pipeline";
import { inMemoryRenderJobStore } from "../render/store";
import type { Project } from "@musicmotion/shared";

describe("Render Pipeline & Store", () => {
  const mockProject: Project = {
    id: "proj-123",
    title: "Summer Vibes",
    status: "ready",
    locale: "en",
    captions: [
      {
        id: "cap-1",
        projectId: "proj-123",
        text: "Sing along with the music",
        startTime: 0,
        endTime: 5,
      },
    ],
    scenes: [
      {
        id: "sc-1",
        projectId: "proj-123",
        prompt: "Sunset beach",
        duration: 5,
        order: 0,
        status: "completed",
        imageUrl: "data:image/svg+xml;utf8,<svg></svg>",
      },
    ],
    videoConfig: {
      width: 1080,
      height: 1920,
      fps: 30,
      aspectRatio: "9:16",
      duration: 5,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    inMemoryRenderJobStore.clear();
  });

  it("validates project structure properly", () => {
    expect(() => validateProjectForRender(mockProject)).not.toThrow();

    expect(() =>
      validateProjectForRender({
        ...mockProject,
        videoConfig: { ...mockProject.videoConfig, duration: 0 },
      })
    ).toThrow(RenderValidationError);
  });

  it("inMemoryRenderJobStore tracks job stages and transitions", () => {
    const job = inMemoryRenderJobStore.createJob("proj-123", "job-1");
    expect(job.id).toBe("job-1");
    expect(job.status).toBe("queued");
    expect(job.stage).toBe("preparing");

    inMemoryRenderJobStore.updateStage("job-1", "rendering", 60, 50, "Rendering frames...");
    const updated = inMemoryRenderJobStore.getJob("job-1");
    expect(updated?.stage).toBe("rendering");
    expect(updated?.progress).toBe(60);

    const completed = inMemoryRenderJobStore.completeJob("job-1", "https://example.com/video.mp4");
    expect(completed?.status).toBe("completed");
    expect(completed?.outputUrl).toBe("https://example.com/video.mp4");
  });

  it("executes the full 7-stage render pipeline", async () => {
    const stagesSeen: string[] = [];

    const result = await executeRenderPipeline(
      {
        jobId: "test-pipeline-job",
        projectId: "proj-123",
        project: mockProject,
      },
      (stage, _stageProgress, _overallProgress) => {
        if (!stagesSeen.includes(stage)) {
          stagesSeen.push(stage);
        }
      }
    );

    expect(result.status).toBe("completed");
    expect(result.stage).toBe("completed");
    expect(result.outputUrl).toBeTruthy();
    expect(stagesSeen).toContain("preparing");
    expect(stagesSeen).toContain("generating");
    expect(stagesSeen).toContain("composing");
    expect(stagesSeen).toContain("rendering");
    expect(stagesSeen).toContain("encoding");
    expect(stagesSeen).toContain("uploading");
  });

  it("handles cancellation gracefully", () => {
    inMemoryRenderJobStore.createJob("proj-123", "cancel-job");
    const cancelled = inMemoryRenderJobStore.cancelJob("cancel-job");
    expect(cancelled?.status).toBe("cancelled");
  });
});