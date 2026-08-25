"use client";

import * as React from "react";
import {
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Download,
  Share2,
  Film,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from "@musicmotion/ui";
import type { Project, RenderProgressInfo } from "@musicmotion/shared";

export interface RenderProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onRenderComplete?: (outputUrl: string) => void;
}

const POLL_INTERVAL_MS = 1500;

export function RenderProgressModal({
  isOpen,
  onClose,
  project,
  onRenderComplete,
}: RenderProgressModalProps) {
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [progressInfo, setProgressInfo] = React.useState<RenderProgressInfo | null>(null);
  const [isStarting, setIsStarting] = React.useState(false);
  const [startError, setStartError] = React.useState<string | null>(null);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const pollTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // ── 1. Stop Polling Helper ──────────────────────────────────
  const stopPolling = React.useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // ── 2. Poll Status ──────────────────────────────────────────
  const pollStatus = React.useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/render/status/${id}`);
        if (!res.ok) return;
        const data: RenderProgressInfo = await res.json();
        setProgressInfo(data);

        if (data.status === "completed") {
          stopPolling();
          if (data.outputUrl && onRenderComplete) {
            onRenderComplete(data.outputUrl);
          }
        } else if (data.status === "failed" || data.status === "cancelled") {
          stopPolling();
        }
      } catch {
        // Network blip — keep polling
      }
    },
    [onRenderComplete, stopPolling]
  );

  // ── 3. Start Render ─────────────────────────────────────────
  const startRender = React.useCallback(async () => {
    setIsStarting(true);
    setStartError(null);
    setProgressInfo(null);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          project,
          options: {
            width: project.videoConfig?.width || 1080,
            height: project.videoConfig?.height || 1920,
            fps: project.videoConfig?.fps || 30,
            crf: 23,
            codec: "h264",
            audioCodec: "aac",
            audioFadeIn: project.trackSelection?.fadeInDuration,
            audioFadeOut: project.trackSelection?.fadeOutDuration,
            watermarkText: "MusicMotion",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStartError(data.error || "Failed to start render pipeline");
        setIsStarting(false);
        return;
      }

      setJobId(data.jobId);
      setProgressInfo(data.job);
      setIsStarting(false);

      // Start continuous polling
      stopPolling();
      pollTimerRef.current = setInterval(() => void pollStatus(data.jobId), POLL_INTERVAL_MS);
    } catch (err) {
      setStartError((err as Error).message);
      setIsStarting(false);
    }
  }, [project, pollStatus, stopPolling]);

  // ── 4. Cancel Render ────────────────────────────────────────
  const handleCancelRender = async () => {
    if (!jobId) return;
    stopPolling();
    try {
      await fetch(`/api/render/cancel/${jobId}`, { method: "DELETE" });
      setProgressInfo((prev) => (prev ? { ...prev, status: "cancelled", progress: 0 } : null));
    } catch {
      // Ignore
    }
  };

  // Launch on open if no active job
  React.useEffect(() => {
    if (isOpen && !jobId && !isStarting && !progressInfo) {
      void startRender();
    }
    return stopPolling;
  }, [isOpen, jobId, isStarting, progressInfo, startRender, stopPolling]);

  const isCompleted = progressInfo?.status === "completed";
  const isFailed = progressInfo?.status === "failed" || !!startError;
  const isCancelled = progressInfo?.status === "cancelled";
  const overallProgress = progressInfo?.progress ?? 0;
  const stages = progressInfo?.stages || [];

  const handleCopyLink = () => {
    if (progressInfo?.outputUrl) {
      navigator.clipboard.writeText(progressInfo.outputUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md sm:max-w-lg bg-zinc-950 border border-white/10 text-white rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Film className="h-4 w-4 text-white" />
              </span>
              <DialogTitle className="text-lg font-black tracking-tight">
                {isCompleted ? "Your Video is Ready!" : "Rendering Video"}
              </DialogTitle>
            </div>
            <Badge
              variant={isCompleted ? "success" : isFailed ? "destructive" : "secondary"}
              className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
            >
              {isCompleted ? "Completed" : isFailed ? "Error" : isCancelled ? "Cancelled" : "In Progress"}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            {isCompleted
              ? "High-definition 9:16 vertical video ready for download and sharing."
              : "Assembling synchronized audio, AI scenes, transitions, and styled captions."}
          </DialogDescription>
        </DialogHeader>

        {/* ── ERROR VIEW ──────────────────────────────────────── */}
        {isFailed && (
          <div className="my-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Rendering Failed</span>
            </div>
            <p className="text-[11px] text-rose-200/80">
              {startError || progressInfo?.error || "An unexpected error occurred during encoding."}
            </p>
            <Button
              onClick={() => void startRender()}
              variant="outline"
              size="sm"
              className="mt-2 text-xs border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Retry Rendering
            </Button>
          </div>
        )}

        {/* ── COMPLETED VIEW: VIDEO PLAYER ────────────────────── */}
        {isCompleted && progressInfo?.outputUrl && (
          <div className="my-4 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-[9/16] max-h-[380px] mx-auto shadow-2xl">
              <video
                src={progressInfo.outputUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Resolution</span>
                <span className="font-bold text-zinc-200">1080 × 1920</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Format</span>
                <span className="font-bold text-zinc-200">MP4 (H.264)</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-[10px] text-zinc-400 block">Frame Rate</span>
                <span className="font-bold text-zinc-200">30 FPS</span>
              </div>
            </div>
          </div>
        )}

        {/* ── IN PROGRESS VIEW: STAGE CHECKLIST ────────────────── */}
        {!isCompleted && !isFailed && (
          <div className="my-4 space-y-4">
            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Total Progress</span>
                <span className="font-mono text-purple-400 font-bold">{overallProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-rose-500 rounded-full transition-all duration-500 ease-out shadow-sm shadow-purple-500/50"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            {/* 7-Stage Checklist */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2.5 max-h-[220px] overflow-y-auto">
              {stages.map((st) => {
                const isActive = st.status === "active";
                const isDone = st.status === "completed";

                return (
                  <div
                    key={st.stage}
                    className={`flex items-center justify-between text-xs py-1 transition-all ${
                      isActive
                        ? "text-white font-bold"
                        : isDone
                        ? "text-zinc-400"
                        : "text-zinc-600"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      ) : isActive ? (
                        <CircleDashed className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
                      ) : (
                        <span className="h-4 w-4 rounded-full border border-zinc-700 flex-shrink-0" />
                      )}
                      <span className="truncate">{st.label}</span>
                    </div>

                    <div className="text-right flex-shrink-0 font-mono text-[11px]">
                      {isDone ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : isActive ? (
                        <span className="text-purple-400 font-bold">
                          {st.progress !== undefined ? `${st.progress}%` : "..."}
                        </span>
                      ) : (
                        <span className="text-zinc-700">pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Background Notification Message */}
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              💡 You can safely leave this page. Video rendering runs asynchronously in background workers.
            </p>
          </div>
        )}

        {/* ── FOOTER ACTIONS ──────────────────────────────────── */}
        <DialogFooter className="flex flex-row items-center justify-between gap-2 sm:gap-0 pt-2 border-t border-white/5">
          {!isCompleted ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelRender}
                className="text-xs text-zinc-400 hover:text-rose-400"
              >
                Cancel Render
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              >
                Run in Background
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setJobId(null);
                  setProgressInfo(null);
                  void startRender();
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Re-render
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="text-xs border-white/10 bg-white/5 text-zinc-200"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  {copiedLink ? "Copied!" : "Copy Link"}
                </Button>
                {progressInfo?.outputUrl && (
                  <a
                    href={progressInfo.outputUrl}
                    download="musicmotion-video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-lg shadow-purple-500/25 hover:opacity-90 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download MP4
                  </a>
                )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}