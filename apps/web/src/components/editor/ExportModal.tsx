"use client";

import * as React from "react";
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
import {
  Sparkles,
  Film,
  Zap,
  Download,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { RenderProgressModal } from "../RenderProgressModal";

export interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { currentProject, trackSelection, captions, scenes, videoConfig } =
    useProjectStore();

  const [resolution, setResolution] = React.useState<"720p" | "1080p">("1080p");
  const [quality, setQuality] = React.useState<"standard" | "high">("high");
  const [isRenderProgressOpen, setIsRenderProgressOpen] = React.useState(false);

  const duration = videoConfig?.duration || 15;
  const estimatedCredits = Math.max(5, Math.ceil(duration * (resolution === "1080p" ? 1.0 : 0.75)));

  const handleStartRender = () => {
    onClose();
    setIsRenderProgressOpen(true);
  };

  const projectToRender = React.useMemo(() => {
    return {
      id: currentProject?.id || "project-export",
      title: currentProject?.title || "MusicMotion Video",
      status: "ready" as const,
      locale: currentProject?.locale || ("en" as const),
      scenes,
      captions,
      trackSelection: trackSelection || undefined,
      videoConfig: {
        ...videoConfig,
        width: resolution === "1080p" ? 1080 : 720,
        height: resolution === "1080p" ? 1920 : 1280,
      },
      createdAt: currentProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [currentProject, scenes, captions, trackSelection, videoConfig, resolution]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border border-white/10 text-white rounded-3xl p-6 space-y-5">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Production Video Export</span>
            </div>
            <DialogTitle className="text-xl font-black text-white">
              Export 9:16 Video
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Render high-definition MP4 with synchronized audio, AI scenes, transitions, and captions.
            </DialogDescription>
          </DialogHeader>

          {/* Configuration Options */}
          <div className="space-y-4 text-xs">
            {/* Format (Locked to 9:16 vertical) */}
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300">Format</label>
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Film className="h-4 w-4 text-purple-400" />
                  <span className="font-bold text-white">9:16 Vertical Reel</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  TikTok / Reels / Shorts
                </Badge>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300">Resolution</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution("720p")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    resolution === "720p"
                      ? "bg-purple-600/20 border-purple-500 text-white shadow-sm"
                      : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <div className="font-bold text-xs">720p HD</div>
                  <div className="text-[10px] text-zinc-500 font-mono">720 × 1280</div>
                </button>

                <button
                  type="button"
                  onClick={() => setResolution("1080p")}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    resolution === "1080p"
                      ? "bg-rose-500/20 border-rose-500 text-white shadow-sm"
                      : "bg-zinc-900/60 border-white/5 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  <span className="absolute top-2 right-2 text-[9px] font-bold text-rose-400 uppercase">
                    Recommended
                  </span>
                  <div className="font-bold text-xs">1080p Full HD</div>
                  <div className="text-[10px] text-zinc-500 font-mono">1080 × 1920</div>
                </button>
              </div>
            </div>

            {/* Quality Preset */}
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-300">Quality</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuality("standard")}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    quality === "standard"
                      ? "bg-white/10 border-white/40 text-white font-bold"
                      : "bg-zinc-900/60 border-white/5 text-zinc-400"
                  }`}
                >
                  Standard (CRF 23)
                </button>
                <button
                  type="button"
                  onClick={() => setQuality("high")}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    quality === "high"
                      ? "bg-white/10 border-white/40 text-white font-bold"
                      : "bg-zinc-900/60 border-white/5 text-zinc-400"
                  }`}
                >
                  High (CRF 18)
                </button>
              </div>
            </div>

            {/* Credits Breakdown */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">Estimated Cost</span>
                  <span className="text-[10px] text-zinc-400">{duration}s video duration</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {estimatedCredits} Credits
                </span>
                <span className="text-[9px] text-emerald-400 block font-medium">Balance: 120</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/10 text-zinc-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleStartRender}
              className="font-bold text-xs gap-1.5 shadow-lg shadow-rose-500/25"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Start Rendering</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7-Stage Render Progress Modal */}
      <RenderProgressModal
        isOpen={isRenderProgressOpen}
        onClose={() => setIsRenderProgressOpen(false)}
        project={projectToRender}
      />
    </>
  );
}