"use client";

import * as React from "react";
import {
  Music2,
  Sparkles,
  Captions as CaptionsIcon,
  Layers,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";

export interface EditorMultiTrackTimelineProps {
  className?: string;
}

export function EditorMultiTrackTimeline({ className = "" }: EditorMultiTrackTimelineProps) {
  const {
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    isPlaying,
    currentTime,
    setIsPlaying,
    setCurrentTime,
    selectedElement,
    setSelectedElement,
    zoomLevel,
    setZoomLevel,
    watermarkText,
  } = useProjectStore();

  const timelineRef = React.useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = React.useState(false);

  const activeTrack = selectedTrack || MOCK_TRACKS[0];
  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const totalDuration = Math.max(1, endTime - startTime);

  // Calculate playhead position in percentage
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  // Timeline Scrubbing handler
  const handleTimelineScrub = React.useCallback(
    (clientX: number) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const percentage = relativeX / rect.width;
      const targetTime = Math.min(totalDuration, Math.max(0, percentage * totalDuration));
      setCurrentTime(targetTime);
    },
    [totalDuration, setCurrentTime]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleTimelineScrub(e.clientX);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        handleTimelineScrub(e.clientX);
      }
    };
    const handleMouseUp = () => {
      if (isScrubbing) {
        setIsScrubbing(false);
      }
    };

    if (isScrubbing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isScrubbing, handleTimelineScrub]);

  // Generate tick markers for the ruler
  const ticks = React.useMemo(() => {
    const count = Math.ceil(totalDuration);
    const result: number[] = [];
    for (let i = 0; i <= count; i += 1) {
      result.push(i);
    }
    return result;
  }, [totalDuration]);

  return (
    <section
      className={`h-64 sm:h-72 border-t border-border/40 bg-zinc-950/90 backdrop-blur-2xl flex flex-col flex-shrink-0 select-none ${className}`}
    >
      {/* ── 1. TIMELINE TOP CONTROL BAR ───────────────────────── */}
      <div className="h-10 border-b border-white/10 px-4 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-white ml-0.5" />}
          </button>

          {/* Timecode */}
          <div className="font-mono text-xs font-bold text-zinc-300">
            <span className="text-purple-400">{formatTime(currentTime)}</span>
            <span className="text-zinc-600"> / </span>
            <span>{formatTime(totalDuration)}</span>
          </div>
        </div>

        {/* Zoom & Track Indicators */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold text-zinc-400 min-w-[32px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. MULTI-TRACK TIMELINE CANVAS ────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Labels) */}
        <div className="w-28 sm:w-36 border-r border-white/10 bg-zinc-900/40 flex flex-col justify-between py-1 flex-shrink-0 z-10">
          {/* Ruler spacer */}
          <div className="h-6 px-3 flex items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Timecode
          </div>
          {/* Track 1: Audio */}
          <div className="h-12 px-3 flex items-center gap-2 text-rose-400 text-xs font-bold">
            <Music2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Audio</span>
          </div>
          {/* Track 2: Scenes */}
          <div className="h-16 px-3 flex items-center gap-2 text-purple-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Scenes</span>
          </div>
          {/* Track 3: Captions */}
          <div className="h-12 px-3 flex items-center gap-2 text-indigo-400 text-xs font-bold">
            <CaptionsIcon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Captions</span>
          </div>
          {/* Track 4: Overlays */}
          <div className="h-10 px-3 flex items-center gap-2 text-amber-400 text-xs font-bold">
            <Layers className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Overlays</span>
          </div>
        </div>

        {/* Scrollable Tracks Area */}
        <div
          ref={timelineRef}
          onMouseDown={handleMouseDown}
          className="flex-1 relative overflow-x-auto overflow-y-hidden cursor-pointer flex flex-col justify-between py-1 bg-zinc-950/50"
        >
          {/* ── Playhead Needle ───────────────────────────────── */}
          <div
            style={{ left: `${playheadPercent}%` }}
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none transition-[left] duration-75 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          >
            <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rotate-45 rounded-sm shadow-md" />
          </div>

          {/* ── Time Ruler ────────────────────────────────────── */}
          <div className="h-6 relative border-b border-white/5 bg-zinc-900/30">
            {ticks.map((t) => {
              const posPercent = (t / totalDuration) * 100;
              if (posPercent > 100) return null;
              return (
                <div
                  key={t}
                  style={{ left: `${posPercent}%` }}
                  className="absolute top-0 bottom-0 flex flex-col items-start"
                >
                  <div className="h-2 w-[1px] bg-zinc-600" />
                  <span className="text-[9px] font-mono text-zinc-500 pl-1">{t}s</span>
                </div>
              );
            })}
          </div>

          {/* ── Track 1: AUDIO ────────────────────────────────── */}
          <div className="h-12 relative my-0.5 px-1">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ type: "track", id: activeTrack.id });
              }}
              className={`h-full rounded-xl border flex items-center px-3 justify-between transition-all ${
                selectedElement.type === "track"
                  ? "bg-rose-500/20 border-rose-500/50 shadow-sm"
                  : "bg-rose-950/30 border-rose-500/20 hover:bg-rose-950/50"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Music2 className="h-3.5 w-3.5 text-rose-400 flex-shrink-0" />
                <span className="text-xs font-bold text-rose-200 truncate">{activeTrack.title}</span>
              </div>
              {/* Simulated Audio Waveform Bar Graphic */}
              <div className="flex items-center gap-0.5 h-6 opacity-60">
                {[40, 70, 90, 30, 85, 60, 95, 40, 80, 50, 70, 30, 90, 80, 60, 95, 45, 75, 35, 80].map(
                  (h, idx) => (
                    <div
                      key={idx}
                      style={{ height: `${h}%` }}
                      className="w-1 bg-rose-400/80 rounded-full"
                    />
                  )
                )}
              </div>
            </div>
          </div>

          {/* ── Track 2: SCENES ───────────────────────────────── */}
          <div className="h-16 relative my-0.5 flex gap-1.5 px-1">
            {scenes.map((sc, idx) => {
              const isSelected = selectedElement.type === "scene" && selectedElement.id === sc.id;
              const sceneWidthPercent = Math.max(10, (sc.duration / totalDuration) * 100);

              return (
                <div
                  key={sc.id}
                  style={{ width: `${sceneWidthPercent}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ type: "scene", id: sc.id });
                  }}
                  className={`h-full rounded-xl border relative p-1.5 flex flex-col justify-between overflow-hidden group transition-all cursor-pointer ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-500 shadow-md ring-1 ring-purple-500"
                      : "bg-purple-950/30 border-purple-500/20 hover:bg-purple-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-400">{sc.duration}s</span>
                  </div>

                  <p className="text-[10px] font-medium text-zinc-200 line-clamp-1 truncate">
                    {sc.prompt}
                  </p>

                  {/* Transition Indicator Pill */}
                  {sc.transition?.type && sc.transition.type !== "cut" && (
                    <span className="text-[8px] font-mono text-purple-300/80 uppercase">
                      ⟷ {sc.transition.type}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Track 3: CAPTIONS ─────────────────────────────── */}
          <div className="h-12 relative my-0.5 px-1">
            {captions.map((cap) => {
              const isSelected = selectedElement.type === "caption" && selectedElement.id === cap.id;
              const startPercent = (cap.startTime / totalDuration) * 100;
              const widthPercent = Math.max(5, ((cap.endTime - cap.startTime) / totalDuration) * 100);

              return (
                <div
                  key={cap.id}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement({ type: "caption", id: cap.id });
                  }}
                  className={`absolute top-0 bottom-0 rounded-xl border px-2 flex items-center justify-between text-[11px] font-bold overflow-hidden cursor-pointer transition-all ${
                    isSelected
                      ? "bg-indigo-600/40 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400"
                      : "bg-indigo-950/40 border-indigo-500/25 text-indigo-200 hover:bg-indigo-950/60"
                  }`}
                >
                  <span className="truncate line-clamp-1">{cap.text}</span>
                  <span className="text-[8px] font-mono text-indigo-300 flex-shrink-0 ml-1">
                    {(cap.endTime - cap.startTime).toFixed(1)}s
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Track 4: OVERLAYS ─────────────────────────────── */}
          <div className="h-10 relative my-0.5 px-1">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement({ type: "overlay", id: "watermark" });
              }}
              className={`h-full rounded-xl border flex items-center px-3 justify-between transition-all ${
                selectedElement.type === "overlay"
                  ? "bg-amber-500/20 border-amber-500/50 shadow-sm"
                  : "bg-amber-950/20 border-amber-500/20 hover:bg-amber-950/40"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-amber-200">
                  Watermark: {watermarkText || "MusicMotion"}
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-400/80">Full Video Length</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}