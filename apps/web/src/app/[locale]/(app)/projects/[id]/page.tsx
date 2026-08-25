"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Music2,
  Captions as CaptionsIcon,
  Sparkles,
  Layers,
  Palette,
  ArrowLeftRight,
  Download,
  Play,
  Pause,
} from "lucide-react";

import {
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Progress,
} from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import {
  formatTime,
  type TransitionType,
} from "@musicmotion/shared";


import { MOCK_TRACKS } from "@/lib/mockData";
import { useRouter } from "@/i18n/routing";
import { AudioTimelineEditor } from "@/components/AudioTimelineEditor";
import { CaptionEditor } from "@/components/CaptionEditor";
import { ScenePlanner } from "@/components/ScenePlanner";

export default function ProjectEditorPage() {

  const t = useTranslations("editor");
  const router = useRouter();

  const {
    currentProject,
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    isPlaying,
    currentTime,
    updateSelection,
    setIsPlaying,
    setCurrentTime,
  } = useProjectStore();

  const [activeSection, setActiveSection] = React.useState<
    "music" | "captions" | "visuals" | "scenes" | "style" | "transitions" | "export"
  >("captions");

  // Export Modal
  const [isExportOpen, setIsExportOpen] = React.useState(false);
  const [isRendering, setIsRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState(0);
  const [renderDone, setRenderDone] = React.useState(false);

  const activeTrack = selectedTrack || MOCK_TRACKS[0];
  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const duration = Math.max(1, endTime - startTime);

  // Playhead scrubber loop
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev: number) => {
          if (prev >= duration) {
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, setCurrentTime]);


  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(10);
    setRenderDone(false);
    const timer = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsRendering(false);
          setRenderDone(true);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const transitionsList: { value: TransitionType; label: string }[] = [

    { value: "fade", label: "Smooth Crossfade" },
    { value: "dissolve", label: "Film Dissolve" },
    { value: "slide_left", label: "Slide Left" },
    { value: "slide_right", label: "Slide Right" },
    { value: "zoom_in", label: "Dynamic Zoom In" },
    { value: "zoom_out", label: "Dynamic Zoom Out" },
    { value: "glitch", label: "Cyber Glitch" },
    { value: "cut", label: "Hard Cut" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Top Pro Header */}
      <div className="h-14 border-b border-border/40 bg-card/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/projects")}
            className="text-xs rounded-xl border-white/10"
          >
            ← Projects
          </Button>
          <h1 className="text-sm font-bold text-foreground">
            {activeTrack.title} • Video Editor
          </h1>
          <Badge variant="accent" className="text-[9px]">9:16 Reel</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="text-xs font-bold rounded-xl shadow-md shadow-rose-500/20"
          >
            <Download className="h-4 w-4 mr-1.5" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Section Navigation Rail (1.5 cols) */}
        <div className="lg:col-span-2 border-r border-border/40 bg-card/30 p-2 flex flex-col gap-1 overflow-y-auto">
          {[
            { id: "music", label: t("music"), icon: Music2 },
            { id: "captions", label: t("captions"), icon: CaptionsIcon },
            { id: "visuals", label: t("visuals"), icon: Sparkles },
            { id: "scenes", label: t("scenes"), icon: Layers },
            { id: "style", label: t("style"), icon: Palette },
            { id: "transitions", label: t("transitions"), icon: ArrowLeftRight },
            { id: "export", label: t("export"), icon: Download },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as typeof activeSection)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isSelected
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Detail Editor (4 cols) */}
        <div className="lg:col-span-5 border-r border-border/40 bg-card/50 p-5 flex flex-col overflow-y-auto space-y-6">
          {/* SECTION 1: MUSIC */}
          {activeSection === "music" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Music Section & Waveform</h3>
              <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Start: {formatTime(startTime)}</span>
                  <span className="font-bold text-rose-400">Duration: {duration.toFixed(1)}s</span>
                  <span className="text-muted-foreground">End: {formatTime(endTime)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Start (s)</label>
                    <Input
                      type="number"
                      value={startTime}
                      onChange={(e) => updateSelection(Number(e.target.value), endTime)}
                      className="h-8 text-xs bg-background/80"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">End (s)</label>
                    <Input
                      type="number"
                      value={endTime}
                      onChange={(e) => updateSelection(startTime, Number(e.target.value))}
                      className="h-8 text-xs bg-background/80"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CAPTIONS */}
          {activeSection === "captions" && (
            <CaptionEditor
              track={activeTrack}
              currentTime={currentTime}
              totalDuration={duration}
            />
          )}


          {/* SECTION 3 & 4: VISUALS & SCENES */}
          {(activeSection === "visuals" || activeSection === "scenes") && (
            <ScenePlanner
              track={activeTrack}
              projectId={currentProject?.id || "project-editor"}
              startTime={startTime}
              endTime={endTime}
              totalDuration={duration}
            />
          )}


          {/* SECTION 5: STYLE */}
          {activeSection === "style" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Style Presets & Typography</h3>
              <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3 text-xs">
                <p className="text-muted-foreground">Apply viral typography and color themes to all captions.</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 rounded-xl bg-black border border-white/20 text-white font-black text-center">
                    NEON GLOW 🔥
                  </button>
                  <button className="p-3 rounded-xl bg-white text-black font-bold text-center">
                    CLEAN MINIMAL ⚡
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: TRANSITIONS */}
          {activeSection === "transitions" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Transitions Gallery</h3>
              <div className="grid grid-cols-2 gap-2">
                {transitionsList.map((tr) => (
                  <button
                    key={tr.value}
                    className="p-3 rounded-xl bg-secondary/40 border border-white/5 hover:border-rose-500/50 text-xs font-bold text-left text-foreground transition-all"
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 7: EXPORT */}
          {activeSection === "export" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Export Configuration</h3>
              <Button
                variant="gradient"
                onClick={() => setIsExportOpen(true)}
                className="w-full rounded-xl font-bold py-3"
              >
                <Download className="h-4 w-4 mr-2" /> Open Export Modal
              </Button>
            </div>
          )}
        </div>

        {/* Center Live Canvas Player (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-black/50 overflow-hidden">
          <div className="relative aspect-[9/16] h-full max-h-[500px] rounded-[36px] bg-neutral-950 border-[6px] border-neutral-800 shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between items-center px-3 text-[10px] text-white/70">
              <span>12:00</span>
              <div className="h-3 w-16 bg-neutral-800 rounded-full" />
              <span>5G</span>
            </div>

            <div className="relative aspect-[9/16] w-full rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-neutral-950 overflow-hidden flex flex-col justify-between p-4 border border-white/10 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-rose-500/30 animate-pulse" />
              </div>

              <div className="relative z-10 self-end">
                <span className="text-[9px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                  MusicMotion
                </span>
              </div>

              {/* Dynamic Captions */}
              <div className="relative z-10 text-center">
                {captions.length > 0 ? (
                  <div className="inline-block bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white font-black text-xs shadow-xl animate-bounce">
                    {captions[0].text}
                  </div>
                ) : (
                  <div className="inline-block bg-black/40 px-2.5 py-1 rounded-lg text-white/50 text-[10px]">
                    Lyrics Preview
                  </div>
                )}
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] text-white/80">
                <span className="font-semibold truncate max-w-[130px]">🎵 {activeTrack.title}</span>
                <span className="text-rose-400 font-mono font-bold">{formatTime(currentTime)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                variant="gradient"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-10 w-10 rounded-full shadow-lg shadow-rose-500/30"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Multi-Track Timeline */}
      <div className="p-3 border-t border-border/40 bg-card/80 backdrop-blur-xl flex-shrink-0">
        <AudioTimelineEditor
          track={activeTrack}
          startTime={startTime}
          endTime={endTime}
          currentTime={currentTime}
          isPlaying={isPlaying}
          minDuration={3}
          maxDuration={60}
          captions={captions}
          scenes={scenes}
          onSelectionChange={(newStart, newEnd) => updateSelection(newStart, newEnd)}
          onTimeUpdate={(newTime) => setCurrentTime(newTime)}
          onPlayPause={(play) => setIsPlaying(play)}
        />
      </div>


      {/* Export Modal */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-md" onClose={() => setIsExportOpen(false)}>
          <DialogHeader>
            <DialogTitle>Export High-Resolution Video</DialogTitle>
            <DialogDescription>Render full HD 1080p MP4 ready for TikTok and Instagram Reels.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-bold">9:16 Vertical (1080x1920)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-bold">{duration.toFixed(1)}s</span>
              </div>
            </div>

            {isRendering && (
              <div className="space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Rendering with Remotion...</span>
                  <span>{renderProgress}%</span>
                </div>
                <Progress value={renderProgress} />
              </div>
            )}

            {renderDone && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-center">
                ✓ Render complete! Ready to download.
              </div>
            )}
          </div>

          <DialogFooter>
            {!renderDone ? (
              <Button
                variant="gradient"
                onClick={handleStartRender}
                disabled={isRendering}
                className="w-full rounded-xl font-bold"
              >
                {isRendering ? `Rendering ${renderProgress}%` : "Start Render"}
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={() => setIsExportOpen(false)}
                className="w-full rounded-xl font-bold"
              >
                <Download className="h-4 w-4 mr-2" /> Download MP4
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
