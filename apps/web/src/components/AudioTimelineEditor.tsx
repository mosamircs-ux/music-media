"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Magnet,
} from "lucide-react";
import { Button, Badge, Slider } from "@musicmotion/ui";

import {
  formatPreciseTime,
  parsePreciseTime,
  snapTime,
  validateTimeRange,
  type SnappingMode,
  type NormalizedTrack,
  type Caption,
  type Scene,
} from "@musicmotion/shared";
import WaveSurfer from "wavesurfer.js";

export interface AudioTimelineEditorProps {
  track: NormalizedTrack;
  startTime: number;
  endTime: number;
  currentTime: number;
  isPlaying: boolean;
  minDuration?: number;
  maxDuration?: number;
  captions?: Caption[];
  scenes?: Scene[];
  onSelectionChange: (startTime: number, endTime: number) => void;
  onTimeUpdate: (currentTime: number) => void;
  onPlayPause: (isPlaying: boolean) => void;
  className?: string;
}

export function AudioTimelineEditor({
  track,
  startTime,
  endTime,
  currentTime,
  isPlaying,
  minDuration = 3,
  maxDuration = 60,
  captions = [],
  scenes = [],
  onSelectionChange,
  onTimeUpdate,
  onPlayPause,
  className = "",
}: AudioTimelineEditorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const waveformRef = React.useRef<HTMLDivElement>(null);
  const wavesurferRef = React.useRef<WaveSurfer | null>(null);

  // Snapping, zoom, audio loop state
  const [snappingMode, setSnappingMode] = React.useState<SnappingMode>("free");
  const [zoomLevel, setZoomLevel] = React.useState<number>(100); // 50% to 300%
  const [isLoopingSelection, setIsLoopingSelection] = React.useState<boolean>(true);
  const [isMuted, setIsMuted] = React.useState<boolean>(false);
  const [volume, setVolume] = React.useState<number>(1.0);

  // Manual inputs editable state
  const [startInput, setStartInput] = React.useState<string>(formatPreciseTime(startTime));
  const [endInput, setEndInput] = React.useState<string>(formatPreciseTime(endTime));
  const [isEditingStart, setIsEditingStart] = React.useState(false);
  const [isEditingEnd, setIsEditingEnd] = React.useState(false);

  // Dragging state for start / end / region
  const [isDraggingStart, setIsDraggingStart] = React.useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = React.useState(false);
  const [isDraggingRegion, setIsDraggingRegion] = React.useState(false);
  const dragStartXRef = React.useRef<number>(0);
  const dragInitialStartRef = React.useRef<number>(0);
  const dragInitialEndRef = React.useRef<number>(0);

  const totalDuration = Math.max(1, track.duration || 180);
  const selectedDuration = Math.max(0.1, endTime - startTime);

  // Sync inputs when external props change and not currently typing
  React.useEffect(() => {
    if (!isEditingStart) {
      setStartInput(formatPreciseTime(startTime));
    }
  }, [startTime, isEditingStart]);

  React.useEffect(() => {
    if (!isEditingEnd) {
      setEndInput(formatPreciseTime(endTime));
    }
  }, [endTime, isEditingEnd]);

  // 1. Initialize WaveSurfer with neon styling
  React.useEffect(() => {
    if (!waveformRef.current) return;

    // Destroy previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    try {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "rgba(244, 63, 94, 0.25)",
        progressColor: "rgba(244, 63, 94, 0.8)",
        cursorColor: "#ffffff",
        cursorWidth: 2,
        height: 64,
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        normalize: true,
        minPxPerSec: (zoomLevel / 100) * 40,
        interact: false, // Timeline handles custom seeking and dragging
      });

      const audioSrc = track.previewUrl || track.audioUrl;
      if (audioSrc) {
        ws.load(audioSrc).catch((err) => {
          console.warn("WaveSurfer audio load skipped/failed:", err);
        });
      }

      wavesurferRef.current = ws;
    } catch (e) {
      console.warn("WaveSurfer setup fallback:", e);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [track.id, track.previewUrl, track.audioUrl]);

  // Update zoom when zoomLevel changes
  React.useEffect(() => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.zoom((zoomLevel / 100) * 40);
      } catch {
        // ignore
      }
    }
  }, [zoomLevel]);

  // 2. Playhead auto-looping / playback timer
  React.useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    if (isPlaying) {
      const step = (now: number) => {
        const delta = (now - lastTime) / 1000;
        lastTime = now;

        const nextTime = currentTime + delta;
        if (nextTime >= endTime) {
          if (isLoopingSelection) {
            onTimeUpdate(startTime);
          } else {
            onPlayPause(false);
            onTimeUpdate(startTime);
          }
        } else {
          onTimeUpdate(nextTime);
        }

        animId = requestAnimationFrame(step);
      };

      animId = requestAnimationFrame(step);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, startTime, endTime, isLoopingSelection, onTimeUpdate, onPlayPause]);

  // 3. Keyboard Shortcuts Listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause(!isPlaying);
          break;

        case "ArrowLeft":
          e.preventDefault();
          {
            const step = e.shiftKey ? 3.0 : 0.5;
            onTimeUpdate(Math.max(startTime, currentTime - step));
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          {
            const step = e.shiftKey ? 3.0 : 0.5;
            onTimeUpdate(Math.min(endTime, currentTime + step));
          }
          break;

        case "Home":
          e.preventDefault();
          onTimeUpdate(startTime);
          break;

        case "End":
          e.preventDefault();
          onTimeUpdate(endTime);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentTime, startTime, endTime, onPlayPause, onTimeUpdate]);

  // 4. Mouse / Touch Dragging Handlers
  const handleMouseDown = (
    e: React.MouseEvent,
    type: "start" | "end" | "region" | "seek"
  ) => {
    e.stopPropagation();
    const rect = waveformRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartXRef.current = e.clientX;
    dragInitialStartRef.current = startTime;
    dragInitialEndRef.current = endTime;

    if (type === "start") {
      setIsDraggingStart(true);
    } else if (type === "end") {
      setIsDraggingEnd(true);
    } else if (type === "region") {
      setIsDraggingRegion(true);
    } else if (type === "seek") {
      const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const seekSec = snapTime(clickRatio * totalDuration, snappingMode, track.bpm);
      onTimeUpdate(seekSec);
    }
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingStart && !isDraggingEnd && !isDraggingRegion) return;
      const rect = waveformRef.current?.getBoundingClientRect();
      if (!rect) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const deltaSec = (deltaX / rect.width) * totalDuration;

      if (isDraggingStart) {
        const rawNewStart = dragInitialStartRef.current + deltaSec;
        const snappedStart = snapTime(rawNewStart, snappingMode, track.bpm);
        const validated = validateTimeRange(
          snappedStart,
          endTime,
          totalDuration,
          minDuration,
          maxDuration
        );
        onSelectionChange(validated.start, validated.end);
      } else if (isDraggingEnd) {
        const rawNewEnd = dragInitialEndRef.current + deltaSec;
        const snappedEnd = snapTime(rawNewEnd, snappingMode, track.bpm);
        const validated = validateTimeRange(
          startTime,
          snappedEnd,
          totalDuration,
          minDuration,
          maxDuration
        );
        onSelectionChange(validated.start, validated.end);
      } else if (isDraggingRegion) {
        const regionLength = dragInitialEndRef.current - dragInitialStartRef.current;
        let newStart = dragInitialStartRef.current + deltaSec;
        newStart = snapTime(newStart, snappingMode, track.bpm);

        if (newStart < 0) newStart = 0;
        if (newStart + regionLength > totalDuration) {
          newStart = totalDuration - regionLength;
        }

        const newEnd = newStart + regionLength;
        const validated = validateTimeRange(
          newStart,
          newEnd,
          totalDuration,
          minDuration,
          maxDuration
        );
        onSelectionChange(validated.start, validated.end);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingRegion(false);
    };

    if (isDraggingStart || isDraggingEnd || isDraggingRegion) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingStart,
    isDraggingEnd,
    isDraggingRegion,
    startTime,
    endTime,
    totalDuration,
    minDuration,
    maxDuration,
    snappingMode,
    track.bpm,
    onSelectionChange,
  ]);

  // 5. Manual Time Input Commit Handlers
  const handleCommitStart = () => {
    setIsEditingStart(false);
    const parsed = parsePreciseTime(startInput);
    if (parsed !== null) {
      const snapped = snapTime(parsed, snappingMode, track.bpm);
      const validated = validateTimeRange(
        snapped,
        endTime,
        totalDuration,
        minDuration,
        maxDuration
      );
      onSelectionChange(validated.start, validated.end);
    } else {
      setStartInput(formatPreciseTime(startTime));
    }
  };

  const handleCommitEnd = () => {
    setIsEditingEnd(false);
    const parsed = parsePreciseTime(endInput);
    if (parsed !== null) {
      const snapped = snapTime(parsed, snappingMode, track.bpm);
      const validated = validateTimeRange(
        startTime,
        snapped,
        totalDuration,
        minDuration,
        maxDuration
      );
      onSelectionChange(validated.start, validated.end);
    } else {
      setEndInput(formatPreciseTime(endTime));
    }
  };

  const handleResetSelection = () => {
    const defaultDur = Math.min(15, totalDuration);
    onSelectionChange(0, defaultDur);
    onTimeUpdate(0);
  };

  const startPercent = (startTime / totalDuration) * 100;
  const durationPercent = ((endTime - startTime) / totalDuration) * 100;
  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));


  return (
    <div
      ref={containerRef}
      className={`rounded-3xl border border-white/10 bg-card/80 backdrop-blur-2xl p-4 shadow-2xl space-y-4 select-none ${className}`}
    >
      {/* 1. TOP HEADER: Precise Timestamps & Snapping Options */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/5 text-xs">
        {/* Left: Track Information & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground truncate max-w-[200px]">
              🎵 {track.title}
            </span>
            <span className="text-[10px] text-muted-foreground">• {track.artist}</span>
            {track.bpm && (
              <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0.5">
                {track.bpm} BPM
              </Badge>
            )}
          </div>
        </div>

        {/* Center: START / END / DURATION Display Boxes */}
        <div className="flex items-center gap-2 sm:gap-3 bg-secondary/40 px-3 py-1.5 rounded-2xl border border-white/5 font-mono">
          {/* START */}
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              START
            </span>
            {isEditingStart ? (
              <input
                type="text"
                value={startInput}
                autoFocus
                onChange={(e) => setStartInput(e.target.value)}
                onBlur={handleCommitStart}
                onKeyDown={(e) => e.key === "Enter" && handleCommitStart()}
                className="w-20 text-xs font-bold text-rose-400 bg-background/80 rounded px-1 text-center border border-rose-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingStart(true)}
                className="text-xs font-bold text-rose-400 hover:underline"
                title="Click to manually edit start timestamp"
              >
                {formatPreciseTime(startTime)}
              </button>
            )}
          </div>

          <span className="text-muted-foreground font-light">|</span>

          {/* END */}
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              END
            </span>
            {isEditingEnd ? (
              <input
                type="text"
                value={endInput}
                autoFocus
                onChange={(e) => setEndInput(e.target.value)}
                onBlur={handleCommitEnd}
                onKeyDown={(e) => e.key === "Enter" && handleCommitEnd()}
                className="w-20 text-xs font-bold text-indigo-400 bg-background/80 rounded px-1 text-center border border-indigo-500"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingEnd(true)}
                className="text-xs font-bold text-indigo-400 hover:underline"
                title="Click to manually edit end timestamp"
              >
                {formatPreciseTime(endTime)}
              </button>
            )}
          </div>

          <span className="text-muted-foreground font-light">|</span>

          {/* DURATION */}
          <div className="text-center">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              DURATION
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {formatPreciseTime(selectedDuration)}
            </span>
          </div>
        </div>

        {/* Right: Snapping & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Snapping Mode Selector */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-white/5">
            <Magnet className="h-3 w-3 text-muted-foreground ml-1" />
            {(["free", "beat", "second"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSnappingMode(mode)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                  snappingMode === mode
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-1.5 text-muted-foreground pl-1">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
              className="p-1 hover:text-foreground"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-mono w-8 text-center">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(300, zoomLevel + 25))}
              className="p-1 hover:text-foreground"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTER: Interactive Multi-Track Waveform Canvas */}
      <div
        ref={waveformRef}
        onClick={(e) => handleMouseDown(e, "seek")}
        className="relative h-24 w-full rounded-2xl bg-secondary/30 border border-white/5 overflow-hidden cursor-crosshair group shadow-inner"
      >
        {/* Background Waveform Bars Fallback (Rendered while audio decodes) */}
        <div className="absolute inset-0 flex items-center justify-between px-3 gap-0.5 opacity-30 pointer-events-none">
          {Array.from({ length: 96 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-muted-foreground/60 rounded-full"
              style={{
                height: `${15 + Math.sin(i * 0.3) * 45 + Math.cos(i * 0.7) * 25}%`,
              }}
            />
          ))}
        </div>

        {/* Selected Region Highlight Overlay */}
        <div
          style={{
            left: `${startPercent}%`,
            width: `${durationPercent}%`,
          }}
          onMouseDown={(e) => handleMouseDown(e, "region")}
          className="absolute inset-y-0 bg-gradient-to-r from-rose-500/20 via-pink-500/25 to-purple-500/20 border-y-2 border-rose-500/40 cursor-grab active:cursor-grabbing z-10 flex items-center justify-between"
          title="Drag center to move selection window"
        >
          {/* Left Handle: Start Marker */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "start")}
            className="absolute left-0 inset-y-0 w-3 bg-rose-500 cursor-ew-resize hover:bg-rose-400 flex items-center justify-center -translate-x-1/2 z-20 rounded-l shadow-lg group/start"
            title={`Start Marker: ${formatPreciseTime(startTime)}`}
          >
            <div className="w-0.5 h-6 bg-white/80 rounded-full" />
            <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/90 border border-rose-500 text-[9px] font-mono text-rose-300 font-bold whitespace-nowrap opacity-0 group-hover/start:opacity-100 transition-opacity pointer-events-none">
              START {formatPreciseTime(startTime)}
            </div>
          </div>

          {/* Right Handle: End Marker */}
          <div
            onMouseDown={(e) => handleMouseDown(e, "end")}
            className="absolute right-0 inset-y-0 w-3 bg-indigo-500 cursor-ew-resize hover:bg-indigo-400 flex items-center justify-center translate-x-1/2 z-20 rounded-r shadow-lg group/end"
            title={`End Marker: ${formatPreciseTime(endTime)}`}
          >
            <div className="w-0.5 h-6 bg-white/80 rounded-full" />
            <div className="absolute -top-7 px-1.5 py-0.5 rounded bg-black/90 border border-indigo-500 text-[9px] font-mono text-indigo-300 font-bold whitespace-nowrap opacity-0 group-hover/end:opacity-100 transition-opacity pointer-events-none">
              END {formatPreciseTime(endTime)}
            </div>
          </div>
        </div>

        {/* Playhead Needle Needle Scrubber */}
        <div
          style={{ left: `${playheadPercent}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-white z-30 pointer-events-none shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all"
        >
          <div className="w-3 h-3 bg-white rotate-45 -translate-x-[5px] -translate-y-1 rounded-sm shadow-md" />
        </div>
      </div>

      {/* 3. MULTI-TRACK LANES: Synchronized Captions & Scenes */}
      <div className="space-y-1.5">
        {/* Captions Track Lane */}
        <div className="h-6 w-full rounded-xl bg-secondary/20 border border-white/5 relative flex items-center px-2 overflow-hidden">
          <span className="text-[8px] uppercase font-bold text-indigo-400 absolute left-2 top-0.5 z-10">
            Captions ({captions.length})
          </span>
          {captions.map((cap, i) => (
            <div
              key={cap.id}
              onClick={() => onTimeUpdate(startTime + cap.startTime)}
              className="absolute inset-y-1 bg-indigo-500/30 border border-indigo-400/50 rounded-lg px-2 flex items-center text-[9px] font-bold text-indigo-200 truncate cursor-pointer hover:bg-indigo-500/50 transition-colors"
              style={{
                left: `${startPercent + (cap.startTime / totalDuration) * 100}%`,
                width: `${Math.max(4, ((cap.endTime - cap.startTime) / totalDuration) * 100)}%`,
              }}
            >
              #{i + 1} {cap.text}
            </div>
          ))}
        </div>

        {/* Scenes Track Lane */}
        <div className="h-6 w-full rounded-xl bg-secondary/20 border border-white/5 relative flex items-center px-2 overflow-hidden">
          <span className="text-[8px] uppercase font-bold text-purple-400 absolute left-2 top-0.5 z-10">
            Scenes ({scenes.length})
          </span>
          {scenes.map((scene, i) => (
            <div
              key={scene.id}
              className="absolute inset-y-1 bg-purple-500/30 border border-purple-400/50 rounded-lg px-2 flex items-center text-[9px] font-bold text-purple-200 truncate hover:bg-purple-500/50 transition-colors cursor-pointer"
              style={{
                left: `${(i * 20) + 10}%`,
                width: "18%",
              }}
            >
              #{i + 1} {scene.prompt}
            </div>
          ))}
        </div>
      </div>

      {/* 4. BOTTOM ACTION BAR: Playback, Seeks, Loop Selection & Volume */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => onPlayPause(!isPlaying)}
            className="h-9 px-4 rounded-xl font-bold shadow-md shadow-rose-500/20"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-1.5 fill-current" />
            ) : (
              <Play className="h-4 w-4 mr-1.5 fill-current ml-0.5" />
            )}
            <span>{isPlaying ? "Pause" : "Play Track"}</span>
          </Button>

          {/* Loop Selection Button */}
          <Button
            variant={isLoopingSelection ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsLoopingSelection(!isLoopingSelection)}
            className={`h-9 rounded-xl border-white/10 text-xs font-semibold ${
              isLoopingSelection ? "text-rose-400 bg-rose-500/10 border-rose-500/30" : ""
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span>Loop Selection</span>
          </Button>

          {/* Jump to Start / End Buttons */}
          <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => onTimeUpdate(startTime)}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
              title="Jump to Start (Home)"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[10px] font-mono text-muted-foreground px-1">
              {formatPreciseTime(currentTime)}
            </span>
            <button
              type="button"
              onClick={() => onTimeUpdate(endTime)}
              className="p-1 text-muted-foreground hover:text-foreground rounded"
              title="Jump to End (End)"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right: Reset Selection & Volume Slider */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetSelection}
            className="h-8 rounded-xl text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Selection
          </Button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <div className="w-20">
              <Slider
                value={isMuted ? 0 : volume * 100}
                min={0}
                max={100}
                step={5}
                onChange={(val) => {
                  setVolume(val / 100);
                  setIsMuted(val === 0);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
