"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Music2,
  Sparkles,
  Captions as CaptionsIcon,
  Video,
  Play,
  Pause,
  Settings,
  Search,
  Film,
} from "lucide-react";

import {
  Button,
  Input,
  Badge,
  Slider,
  Select,
} from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime, type VisualStyle, type AspectRatio } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";
import { useRouter } from "@/i18n/routing";
import { AudioTimelineEditor } from "@/components/AudioTimelineEditor";
import { CaptionEditor } from "@/components/CaptionEditor";
import { ScenePlanner } from "@/components/ScenePlanner";
import { RenderProgressModal } from "@/components/RenderProgressModal";

export default function CreateWorkspacePage() {
  const t = useTranslations("create");
  const router = useRouter();

  const {
    currentProject,
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    videoConfig,
    isPlaying,
    currentTime,
    selectTrack,
    updateSelection,
    setIsPlaying,
    setCurrentTime,
    setVideoConfig,
  } = useProjectStore();

  // Track fallback
  const activeTrack = selectedTrack || MOCK_TRACKS[0];
  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const selectedDuration = Math.max(1, endTime - startTime);

  // States
  const isLooping = true;
  const [activeTabLeft, setActiveTabLeft] = React.useState<"music" | "captions" | "scenes">("music");
  const [selectedStyle, setSelectedStyle] = React.useState<VisualStyle>("Cinematic");
  const [searchMusicQuery, setSearchMusicQuery] = React.useState("");

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  // Playhead simulation timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev: number) => {
          if (prev >= selectedDuration) {
            return isLooping ? 0 : selectedDuration;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDuration, isLooping, setCurrentTime]);



  const visualStylesList: VisualStyle[] = [
    "Cinematic",
    "Anime",
    "Realistic",
    "Dreamy",
    "Dark",
    "Retro",
    "Fantasy",
    "Minimal",
    "Music Video",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* 1. Top Action Toolbar */}
      <div className="h-14 border-b border-border/40 bg-card/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-rose-500" />
            <h1 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">
              {activeTrack.title} — AI Music Video Studio
            </h1>
          </div>
          <Badge variant="accent" className="hidden sm:inline-flex text-[10px]">
            {videoConfig.aspectRatio} Vertical Reel
          </Badge>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/projects")}
            className="text-xs rounded-xl border-white/10"
          >
            My Projects
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="text-xs font-bold rounded-xl shadow-md shadow-rose-500/20"
          >
            <Video className="h-4 w-4 mr-1.5" />
            {t("exportVideo")}
          </Button>
        </div>
      </div>

      {/* 2. Main 3-Column Studio Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT COLUMN: Music / Captions / Scenes Panel (3.5 cols) */}
        <div className="lg:col-span-4 border-r border-border/40 bg-card/40 flex flex-col overflow-hidden">
          {/* Sub-Tabs */}
          <div className="p-3 border-b border-border/40 flex items-center gap-1.5 bg-secondary/20">
            <button
              onClick={() => setActiveTabLeft("music")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTabLeft === "music"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Music2 className="h-3.5 w-3.5" />
              <span>Music</span>
            </button>
            <button
              onClick={() => setActiveTabLeft("scenes")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTabLeft === "scenes"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Scenes ({scenes.length})</span>
            </button>
            <button
              onClick={() => setActiveTabLeft("captions")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTabLeft === "captions"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <CaptionsIcon className="h-3.5 w-3.5" />
              <span>Captions ({captions.length})</span>
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* SUB-TAB 1: MUSIC */}
            {activeTabLeft === "music" && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchMusicQuery}
                    onChange={(e) => setSearchMusicQuery(e.target.value)}
                    placeholder="Search licensed tracks..."
                    className="pl-9 h-9 text-xs rounded-xl bg-background/60"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                    <span>Available Tracks</span>
                    <Badge variant="success" className="text-[9px] px-1.5">Licensed & Uploads</Badge>
                  </div>
                  {MOCK_TRACKS.filter((t) =>
                    !searchMusicQuery ||
                    t.title.toLowerCase().includes(searchMusicQuery.toLowerCase()) ||
                    t.artist.toLowerCase().includes(searchMusicQuery.toLowerCase())
                  ).map((track) => {
                    const isSelected = track.id === activeTrack.id;
                    const albumArt = track.albumArt || track.coverArtUrl;
                    return (
                      <div
                        key={track.id}
                        onClick={() => selectTrack(track)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? "border-rose-500 bg-rose-500/10"
                            : "border-white/5 bg-secondary/30 hover:bg-secondary/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {albumArt ? (
                            <img
                              src={albumArt}
                              alt={track.title}
                              className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                              <Music2 className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-secondary text-muted-foreground uppercase font-bold">
                                {track.provider}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            {formatTime(track.duration)}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-bold text-rose-400">ACTIVE</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* SUB-TAB 2: AI SCENES */}
            {activeTabLeft === "scenes" && (
              <ScenePlanner
                track={activeTrack}
                projectId={currentProject?.id || "create-draft"}
                startTime={startTime}
                endTime={endTime}
                totalDuration={selectedDuration}
              />
            )}


            {/* SUB-TAB 3: CAPTIONS */}
            {activeTabLeft === "captions" && (
              <CaptionEditor
                track={activeTrack}
                currentTime={currentTime >= startTime ? currentTime - startTime : currentTime}
                totalDuration={selectedDuration}
              />
            )}
          </div>
        </div>

        {/* CENTER COLUMN: Live Video Player Canvas (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-black/40 border-r border-border/40 relative overflow-hidden">
          {/* Phone Frame Container */}
          <div className="relative aspect-[9/16] h-full max-h-[460px] rounded-[36px] bg-neutral-950 border-[6px] border-neutral-800 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
            {/* Phone Top Notch */}
            <div className="flex justify-between items-center px-3 text-[10px] text-white/70">
              <span className="font-semibold">12:00</span>
              <div className="h-3 w-16 bg-neutral-800 rounded-full" />
              <span>5G</span>
            </div>

            {/* Video Canvas Scene Visual */}
            <div className="relative aspect-[9/16] w-full rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-neutral-950 overflow-hidden flex flex-col justify-between p-4 border border-white/10 shadow-inner">
              {/* Dynamic Simulated Visual Scene */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-rose-500/30 animate-pulse" />
              </div>

              {/* Watermark */}
              <div className="relative z-10 self-end">
                <span className="text-[9px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                  MusicMotion
                </span>
              </div>

              {/* Real-time Dynamic Captions Overlay */}
              <div className="relative z-10 text-center px-2">
                {(() => {
                  const relTime = currentTime >= startTime ? currentTime - startTime : currentTime;
                  const activeCap = captions.find(
                    (c) => relTime >= c.startTime && relTime <= c.endTime
                  ) || (captions.length > 0 ? captions[0] : null);

                  if (activeCap) {
                    return (
                      <div
                        dir={activeCap.isRTL ? "rtl" : "ltr"}
                        className="inline-block bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-white font-extrabold text-xs shadow-2xl transition-all"
                      >
                        {activeCap.text}
                      </div>
                    );
                  }

                  return (
                    <div className="inline-block bg-black/40 px-2.5 py-1 rounded-lg text-white/50 text-[10px]">
                      Lyrics & Captions Overlay
                    </div>
                  );
                })()}
              </div>

              {/* Track Meta */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-white/80">
                <span className="font-semibold truncate max-w-[130px]">🎵 {activeTrack.title}</span>
                <span className="text-rose-400 font-mono font-bold">{formatTime(currentTime)} / {formatTime(selectedDuration)}</span>
              </div>
            </div>


            {/* In-Canvas Mini Playback Pill */}
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

        {/* RIGHT COLUMN: Settings & Visual Presets (3.5 cols) */}
        <div className="lg:col-span-3 bg-card/40 flex flex-col overflow-y-auto p-4 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-3">
              <Settings className="h-3.5 w-3.5 text-rose-500" />
              <span>Studio Configuration</span>
            </h3>

            {/* Visual Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">AI Visual Style</label>
              <Select
                value={selectedStyle}
                onChange={(val) => setSelectedStyle(val as VisualStyle)}
                options={visualStylesList.map((s) => ({ value: s, label: s }))}
              />
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {(["9:16", "16:9", "1:1"] as AspectRatio[]).map((ar) => (
                <button
                  key={ar}
                  onClick={() => setVideoConfig({ aspectRatio: ar })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    videoConfig.aspectRatio === ar
                      ? "border-rose-500 bg-rose-500/10 text-rose-400"
                      : "border-white/5 bg-secondary/40 text-muted-foreground"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & FPS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Resolution</label>
              <Select
                value={videoConfig.resolution || "1080p"}
                onChange={(val) => setVideoConfig({ resolution: val as "720p" | "1080p" | "4k" })}
                options={[
                  { value: "720p", label: "720p HD" },
                  { value: "1080p", label: "1080p Full HD" },
                  { value: "4k", label: "4K Ultra HD" },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Frame Rate</label>
              <Select
                value={String(videoConfig.fps || 30)}
                onChange={(val) => setVideoConfig({ fps: Number(val) })}
                options={[
                  { value: "30", label: "30 FPS" },
                  { value: "60", label: "60 FPS" },
                ]}
              />
            </div>
          </div>

          {/* Audio Fade Options */}
          <div className="p-3 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold text-foreground">Audio Crossfade & Volume</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Fade In</span>
                <span>0.5s</span>
              </div>
              <Slider value={5} min={0} max={30} step={1} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Fade Out</span>
                <span>0.5s</span>
              </div>
              <Slider value={5} min={0} max={30} step={1} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: Audio Timeline Editor */}
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



      {/* 4. Export & Rendering Dialog Modal */}
      {isExportModalOpen && (
        <RenderProgressModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={
            currentProject || {
              id: "create-draft",
              title: activeTrack.title,
              status: "ready",
              locale: "en",
              trackSelection: {
                id: "selection-1",
                projectId: "create-draft",
                trackId: activeTrack.id,
                startTime,
                endTime,
              },
              captions,
              scenes,
              videoConfig: {
                width: videoConfig.width || 1080,
                height: videoConfig.height || 1920,
                fps: videoConfig.fps || 30,
                aspectRatio: "9:16",
                duration: selectedDuration,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        />
      )}
    </div>
  );
}

