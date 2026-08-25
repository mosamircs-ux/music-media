"use client";

import * as React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime, type Scene, type Caption } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";

export interface EditorPreviewCanvasProps {
  className?: string;
}

export function EditorPreviewCanvas({ className = "" }: EditorPreviewCanvasProps) {
  const {
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    isPlaying,
    currentTime,
    setIsPlaying,
    setCurrentTime,
    showSafeZones,
    watermarkText,
    isFullscreenPreview,
    setIsFullscreenPreview,
  } = useProjectStore();

  const [isMuted, setIsMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const activeTrack = selectedTrack || MOCK_TRACKS[0];
  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const totalDuration = Math.max(1, endTime - startTime);

  // Playhead scrubber loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev: number) => {
          if (prev >= totalDuration) {
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, setCurrentTime]);

  // Audio synchronization with playhead
  React.useEffect(() => {
    if (!audioRef.current || !activeTrack.audioUrl) return;
    if (isPlaying) {
      audioRef.current.currentTime = startTime + currentTime;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTime, startTime, activeTrack.audioUrl]);

  // Active scene calculation
  const activeSceneIndex = React.useMemo(() => {
    if (scenes.length === 0) return 0;
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      const duration = scenes[i].duration || totalDuration / scenes.length;
      if (currentTime >= accumulated && currentTime < accumulated + duration) {
        return i;
      }
      accumulated += duration;
    }
    return Math.min(scenes.length - 1, Math.max(0, Math.floor((currentTime / totalDuration) * scenes.length)));
  }, [scenes, currentTime, totalDuration]);

  const activeScene: Scene | undefined = scenes[activeSceneIndex];

  // Active caption calculation
  const activeCaption: Caption | undefined = React.useMemo(() => {
    return captions.find((c) => currentTime >= c.startTime && currentTime <= c.endTime);
  }, [captions, currentTime]);

  return (
    <main
      className={`relative flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4 overflow-hidden select-none ${
        isFullscreenPreview ? "fixed inset-0 z-50 p-0 bg-black" : ""
      } ${className}`}
    >
      {/* Hidden Audio Element for synced playback */}
      {activeTrack.audioUrl && (
        <audio
          ref={audioRef}
          src={activeTrack.audioUrl}
          muted={isMuted}
          preload="auto"
        />
      )}

      {/* ── 9:16 VERTICAL VIDEO FRAME CONTAINER ───────────────── */}
      <div
        className={`relative aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-between transition-all duration-300 ${
          isFullscreenPreview ? "h-full rounded-none border-none max-h-screen" : "max-h-[75vh] w-auto"
        }`}
      >
        {/* 1. Visual Scene Layer (Ken Burns zoom effect) */}
        <div className="absolute inset-0 overflow-hidden bg-zinc-900">
          {activeScene?.imageUrl ? (
            <img
              src={activeScene.imageUrl}
              alt={activeScene.prompt}
              className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                isPlaying ? "scale-110" : "scale-100"
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-purple-950/40 via-zinc-900 to-black">
              <Sparkles className="h-10 w-10 text-purple-400/60 mb-3 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-300">
                Scene {activeSceneIndex + 1}
              </h4>
              <p className="text-[11px] text-zinc-400 line-clamp-3 mt-1 max-w-[200px]">
                {activeScene?.prompt || "Ready for AI Scene Generation"}
              </p>
            </div>
          )}
        </div>

        {/* 2. Watermark / Branding Badge */}
        {watermarkText && (
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white/80 tracking-wider shadow-md pointer-events-none z-10">
            {watermarkText}
          </div>
        )}

        {/* 3. Safe Zones Overlay (9:16 Social UI Clearance) */}
        {showSafeZones && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 border-2 border-dashed border-amber-400/30">
            {/* Top UI clearance (15%) */}
            <div className="h-[15%] border-b border-amber-400/20 bg-amber-500/5 flex items-start justify-center pt-1">
              <span className="text-[9px] font-mono text-amber-300/60 uppercase">Header Safe Zone</span>
            </div>

            {/* Middle Active Story Area */}
            <div className="flex-1 flex items-center justify-center">
              <span className="text-[9px] font-mono text-white/20">9:16 Focal Center</span>
            </div>

            {/* Bottom Engagement clearance (20%) */}
            <div className="h-[20%] border-t border-amber-400/20 bg-amber-500/5 flex items-end justify-center pb-1">
              <span className="text-[9px] font-mono text-amber-300/60 uppercase">Caption Safe Zone</span>
            </div>
          </div>
        )}

        {/* 4. Dynamic Styled Captions Overlay */}
        <div className="absolute inset-x-4 bottom-[22%] z-30 flex items-center justify-center pointer-events-none">
          {activeCaption && (
            <div
              className={`max-w-[90%] px-4 py-2 rounded-2xl text-center shadow-2xl transition-all transform animate-in fade-in zoom-in duration-200 ${
                activeCaption.style === "Neon"
                  ? "bg-black/80 border-2 border-pink-500 text-pink-300 shadow-pink-500/50"
                  : activeCaption.style === "Karaoke"
                  ? "bg-indigo-950/80 border border-indigo-400 text-amber-300 font-black"
                  : activeCaption.style === "Cinematic"
                  ? "bg-black/60 text-white font-serif tracking-widest uppercase border-y border-white/20"
                  : activeCaption.style === "Minimal"
                  ? "text-white font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  : "bg-black/70 backdrop-blur-md text-white font-bold border border-white/10"
              }`}
              dir={activeCaption.isRTL ? "rtl" : "ltr"}
            >
              <p
                style={{
                  fontSize: `${Math.max(14, Math.min(26, (activeCaption.fontSize || 42) * 0.45))}px`,
                  color: activeCaption.color || "#ffffff",
                }}
                className="leading-snug tracking-tight drop-shadow-md"
              >
                {activeCaption.text}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING PLAYBACK HUD SCRUBBER ────────────────────── */}
      <div className="mt-4 flex items-center gap-3 bg-zinc-900/90 border border-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl z-20">
        {/* Reset to Start */}
        <button
          type="button"
          onClick={() => setCurrentTime(0)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-all hover:bg-white/5"
          title="Restart"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* Play / Pause Toggle */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all"
          title="Play / Pause (Space)"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
        </button>

        {/* Timecode */}
        <div className="font-mono text-xs font-bold text-zinc-300 px-2 min-w-[100px] text-center">
          <span className="text-purple-400">{formatTime(currentTime)}</span>
          <span className="text-zinc-600"> / </span>
          <span>{formatTime(totalDuration)}</span>
        </div>

        {/* Mute Audio Toggle */}
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`p-1.5 rounded-lg transition-all ${
            isMuted ? "text-rose-400 hover:bg-rose-500/10" : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Fullscreen Mode */}
        <button
          type="button"
          onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          title={isFullscreenPreview ? "Exit Fullscreen" : "Fullscreen Preview"}
        >
          {isFullscreenPreview ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </main>
  );
}