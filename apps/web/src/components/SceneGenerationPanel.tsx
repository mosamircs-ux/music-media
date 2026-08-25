"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Scene, GenerationJobStatus } from "@musicmotion/shared";
import { useProjectStore } from "@/stores/projectStore";

interface SceneGenerationPanelProps {
  scene: Scene;
  projectId: string;
  visualStyle?: string;
  className?: string;
}

const POLL_INTERVAL_MS = 3000;
const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export function SceneGenerationPanel({
  scene,
  projectId,
  visualStyle,
  className = "",
}: SceneGenerationPanelProps) {
  const { generationJobs, setGenerationJob, clearGenerationJob, updateScene } = useProjectStore();
  const job = generationJobs[scene.id];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ── Polling ──────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (jobId: string) => {
      try {
        const res = await fetch(`/api/generate/status/${jobId}`);
        if (!res.ok) return;
        const data: GenerationJobStatus = await res.json();
        setGenerationJob(scene.id, data);

        // When completed — update the scene image URL
        if (data.status === "completed" && (data.storageUrl ?? data.previewUrl)) {
          updateScene(scene.id, { imageUrl: data.storageUrl ?? data.previewUrl, status: "completed" });
        }
        if (data.status === "failed") {
          updateScene(scene.id, { status: "failed" });
        }

        if (TERMINAL_STATUSES.has(data.status)) stopPolling();
      } catch {
        // Network error — keep polling
      }
    },
    [scene.id, setGenerationJob, updateScene, stopPolling]
  );

  const startPolling = useCallback(
    (jobId: string) => {
      stopPolling();
      pollRef.current = setInterval(() => void pollStatus(jobId), POLL_INTERVAL_MS);
    },
    [stopPolling, pollStatus]
  );

  useEffect(() => {
    // Resume polling if there is an active job on mount
    if (job && !TERMINAL_STATUSES.has(job.status)) {
      startPolling(job.jobId);
    }
    return stopPolling;
  }, [job, startPolling, stopPolling]);

  // ── Actions ──────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!scene.prompt.trim()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/generate/scene", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          scenes: [{ sceneId: scene.id, prompt: scene.prompt, visualStyle }],
        }),
      });

      const data = await res.json() as { success?: boolean; jobs?: Array<{ sceneId: string; jobId: string; assetId: string; isDuplicate: boolean }>; error?: string };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Generation request failed");
        return;
      }

      const jobEntry = data.jobs?.[0];
      if (!jobEntry) return;

      const initialStatus: GenerationJobStatus = {
        jobId: jobEntry.jobId,
        assetId: jobEntry.assetId,
        sceneId: scene.id,
        status: "queued",
        progress: 5,
        updatedAt: new Date().toISOString(),
      };

      setGenerationJob(scene.id, initialStatus);
      updateScene(scene.id, { status: "generating" });
      startPolling(jobEntry.jobId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [scene, projectId, visualStyle, setGenerationJob, updateScene, startPolling]);

  const handleCancel = useCallback(async () => {
    if (!job?.jobId) return;
    stopPolling();
    try {
      await fetch(`/api/generate/cancel/${job.jobId}`, { method: "DELETE" });
      setGenerationJob(scene.id, { ...job, status: "cancelled", progress: 0 });
      updateScene(scene.id, { status: "idle" });
    } catch {
      setError("Cancel failed — try again");
    }
  }, [job, scene.id, setGenerationJob, updateScene, stopPolling]);

  const handleRetry = useCallback(async () => {
    clearGenerationJob(scene.id);
    updateScene(scene.id, { status: "idle", imageUrl: undefined });
    await handleGenerate();
  }, [scene.id, clearGenerationJob, updateScene, handleGenerate]);

  const handleRegenerate = useCallback(async () => {
    clearGenerationJob(scene.id);
    updateScene(scene.id, { status: "idle", imageUrl: undefined });
    await handleGenerate();
  }, [scene.id, clearGenerationJob, updateScene, handleGenerate]);

  // ── Derived state ─────────────────────────────────────────────
  const isActive = job && !TERMINAL_STATUSES.has(job.status);
  const isCompleted = job?.status === "completed";
  const isFailed = job?.status === "failed";
  const isCancelled = job?.status === "cancelled";
  const progress = job?.progress ?? 0;
  const previewUrl = job?.previewUrl ?? scene.imageUrl;

  return (
    <div className={`scene-gen-panel ${className}`}>
      {/* Preview thumbnail */}
      {previewUrl && (
        <div className="scene-gen-preview">
          <img src={previewUrl} alt="Generated visual" className="scene-gen-thumb" />
          {isCompleted && (
            <div className="scene-gen-badge completed">✓ Generated</div>
          )}
        </div>
      )}

      {/* Progress bar (active jobs) */}
      {isActive && (
        <div className="scene-gen-progress-wrap">
          <div className="scene-gen-progress-track">
            <div
              className="scene-gen-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="scene-gen-progress-label">
            {job.status === "queued" ? "Queued…" : `Generating… ${progress}%`}
          </span>
        </div>
      )}

      {/* Status badge */}
      {job && TERMINAL_STATUSES.has(job.status) && !previewUrl && (
        <div className={`scene-gen-badge ${job.status}`}>
          {job.status === "completed" ? "✓ Done" : job.status === "failed" ? "✗ Failed" : "○ Cancelled"}
        </div>
      )}

      {/* Error */}
      {(error ?? isFailed) && (
        <p className="scene-gen-error">{error ?? job?.error ?? "Generation failed"}</p>
      )}

      {/* Action buttons */}
      <div className="scene-gen-actions">
        {!job && !isActive && (
          <button
            onClick={() => void handleGenerate()}
            disabled={isSubmitting || !scene.prompt.trim()}
            className="scene-gen-btn primary"
            title="Generate visual image for this scene"
          >
            {isSubmitting ? (
              <span className="scene-gen-spinner" />
            ) : (
              <>✦ Generate Visual</>
            )}
          </button>
        )}

        {isActive && (
          <button onClick={() => void handleCancel()} className="scene-gen-btn cancel">
            ✕ Cancel
          </button>
        )}

        {isCompleted && (
          <button onClick={() => void handleRegenerate()} className="scene-gen-btn secondary">
            ↻ Regenerate
          </button>
        )}

        {(isFailed || isCancelled) && (
          <button onClick={() => void handleRetry()} className="scene-gen-btn primary">
            ↺ Retry
          </button>
        )}
      </div>
    </div>
  );
}