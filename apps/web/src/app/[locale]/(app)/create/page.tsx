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
  Plus,
  Trash2,
  RefreshCw,
  Settings,
  ZoomIn,
  ZoomOut,
  Search,
  Download,
  Film,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  Slider,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Progress,
} from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime, type VisualStyle, type AspectRatio } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";
import { useRouter } from "@/i18n/routing";

export default function CreateWorkspacePage() {
  const t = useTranslations("create");
  const editorT = useTranslations("editor");
  const router = useRouter();

  const {
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    videoConfig,
    isPlaying,
    currentTime,
    selectTrack,
    addCaption,
    removeCaption,
    addScene,
    removeScene,
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
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const isLooping = true;
  const [activeTabLeft, setActiveTabLeft] = React.useState<"music" | "captions" | "scenes">("music");
  const [newCaptionText, setNewCaptionText] = React.useState("");
  const [newScenePrompt, setNewScenePrompt] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState<VisualStyle>("Cinematic");
  const [searchMusicQuery, setSearchMusicQuery] = React.useState("");
  const [isEnhancing, setIsEnhancing] = React.useState(false);

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isRendering, setIsRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState(0);
  const [renderFinished, setRenderFinished] = React.useState(false);

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

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(5);
    setRenderFinished(false);

    const timer = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsRendering(false);
          setRenderFinished(true);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  const handleAddCaptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaptionText.trim()) return;
    addCaption(newCaptionText, Math.max(0, currentTime), Math.min(currentTime + 3, selectedDuration));
    setNewCaptionText("");
  };

  const handleAddSceneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenePrompt.trim()) return;
    addScene(newScenePrompt, 5);
    setNewScenePrompt("");
  };

  const handleEnhancePrompt = () => {
    if (!newScenePrompt.trim()) return;
    setIsEnhancing(true);
    setTimeout(() => {
      setNewScenePrompt(
        `Cinematic ${selectedStyle} atmosphere: "${newScenePrompt}", anamorphic lens flares, dynamic camera motion, 9:16 vertical render`
      );
      setIsEnhancing(false);
    }, 600);
  };

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
              <div className="space-y-4">
                <form onSubmit={handleAddSceneSubmit} className="space-y-3 p-3 rounded-2xl bg-secondary/30 border border-white/5">
                  <label className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>Prompt Visual Scene</span>
                    <button
                      type="button"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !newScenePrompt.trim()}
                      className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="h-3 w-3" />
                      {isEnhancing ? "Enhancing..." : "Enhance Prompt"}
                    </button>
                  </label>
                  <Input
                    value={newScenePrompt}
                    onChange={(e) => setNewScenePrompt(e.target.value)}
                    placeholder="Describe scene visual vibe..."
                    className="h-9 text-xs rounded-xl bg-background/80"
                  />
                  <Button type="submit" variant="gradient" size="sm" className="w-full rounded-xl text-xs font-bold">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Scene
                  </Button>
                </form>

                {/* Scene List */}
                <div className="space-y-2">
                  {scenes.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                      <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/40" />
                      <p>No visual scenes yet. Prompt one above or use a template.</p>
                    </div>
                  ) : (
                    scenes.map((scene, idx) => (
                      <div key={scene.id} className="p-3 rounded-xl bg-secondary/40 border border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-foreground truncate">{scene.prompt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[9px]">{scene.duration}s</Badge>
                          <button onClick={() => removeScene(scene.id)} className="text-muted-foreground hover:text-rose-500 p-1">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUB-TAB 3: CAPTIONS */}
            {activeTabLeft === "captions" && (
              <div className="space-y-4">
                <form onSubmit={handleAddCaptionSubmit} className="space-y-3 p-3 rounded-2xl bg-secondary/30 border border-white/5">
                  <label className="text-xs font-bold text-foreground">Add Lyric / Subtitle</label>
                  <Input
                    value={newCaptionText}
                    onChange={(e) => setNewCaptionText(e.target.value)}
                    placeholder="Enter lyric or caption text..."
                    className="h-9 text-xs rounded-xl bg-background/80"
                  />
                  <Button type="submit" variant="gradient" size="sm" className="w-full rounded-xl text-xs font-bold">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add at Current Time ({formatTime(currentTime)})
                  </Button>
                </form>

                <div className="space-y-2">
                  {captions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
                      <CaptionsIcon className="h-8 w-8 mx-auto text-muted-foreground/40" />
                      <p>No captions added. Type lyrics to sync with audio beats.</p>
                    </div>
                  ) : (
                    captions.map((cap) => (
                      <div key={cap.id} className="p-3 rounded-xl bg-secondary/40 border border-white/5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{cap.text}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {formatTime(cap.startTime)} - {formatTime(cap.endTime)}
                          </span>
                        </div>
                        <button onClick={() => removeCaption(cap.id)} className="text-muted-foreground hover:text-rose-500 p-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
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
              <div className="relative z-10 text-center">
                {captions.length > 0 ? (
                  <div className="inline-block bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-white font-black text-xs shadow-xl animate-bounce">
                    {captions[0].text}
                  </div>
                ) : (
                  <div className="inline-block bg-black/40 px-2.5 py-1 rounded-lg text-white/50 text-[10px]">
                    Lyrics & Captions Overlay
                  </div>
                )}
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

      {/* 3. BOTTOM: Multi-Track Timeline */}
      <div className="h-44 border-t border-border/40 bg-card/80 backdrop-blur-xl p-3 flex flex-col justify-between flex-shrink-0">
        {/* Timeline Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-8 px-3 rounded-lg font-bold"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
              <span>{isPlaying ? "Pause" : "Play"}</span>
            </Button>
            <span className="font-mono text-xs font-bold text-foreground">
              {formatTime(currentTime)} <span className="text-muted-foreground">/ {formatTime(selectedDuration)}</span>
            </span>
            <Badge variant="secondary" className="text-[10px] font-mono">
              Clip Duration: {selectedDuration.toFixed(1)}s
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 20))} className="p-1 hover:text-foreground">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono">{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 20))} className="p-1 hover:text-foreground">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-Track Canvas */}
        <div
          className="flex-1 space-y-1.5 py-1.5 relative overflow-x-auto cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progressRatio = Math.max(0, Math.min(1, clickX / rect.width));
            setCurrentTime(progressRatio * selectedDuration);
          }}
        >
          {/* Playhead Needle Scrubber Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none transition-all"
            style={{
              left: `${Math.min(100, Math.max(0, (currentTime / selectedDuration) * 100))}%`,
            }}
          >
            <div className="w-3 h-3 bg-rose-500 rotate-45 -translate-x-[5px] -translate-y-1 rounded-sm shadow-md shadow-rose-500/50" />
          </div>

          {/* TRACK 1: Waveform Trimmer Track */}
          <div className="h-10 w-full rounded-lg bg-secondary/40 border border-white/5 relative flex items-center px-2">
            <span className="absolute left-2 top-0.5 text-[9px] uppercase font-bold text-muted-foreground z-10">
              Audio Waveform (Start: {formatTime(startTime)} • End: {formatTime(endTime)})
            </span>
            {/* Draggable Selection Handle Overlay */}
            <div
              className="absolute inset-y-0 bg-rose-500/25 border-x-2 border-rose-500 flex items-center justify-between px-1"
              style={{
                left: `${(startTime / activeTrack.duration) * 100}%`,
                width: `${(selectedDuration / activeTrack.duration) * 100}%`,
              }}
            >
              <div className="w-1.5 h-6 bg-rose-400 rounded-full cursor-ew-resize shadow-sm" title="Start Marker" />
              <div className="w-1.5 h-6 bg-rose-400 rounded-full cursor-ew-resize shadow-sm" title="End Marker" />
            </div>
            {/* Waveform Bars */}
            <div className="w-full flex items-center justify-between gap-0.5 opacity-60">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-muted-foreground/40 rounded-full"
                  style={{ height: `${20 + Math.sin(i * 0.4) * 35 + Math.random() * 20}%` }}
                />
              ))}
            </div>
          </div>

          {/* TRACK 2: Captions Track */}
          <div className="h-6 w-full rounded-lg bg-secondary/20 border border-white/5 relative flex items-center px-2">
            <span className="absolute left-2 top-0.5 text-[8px] uppercase font-bold text-indigo-400">Captions</span>
            {captions.map((cap, i) => (
              <div
                key={cap.id}
                className="absolute inset-y-1 bg-indigo-500/40 border border-indigo-400 rounded px-2 flex items-center text-[9px] font-bold text-indigo-200 truncate cursor-pointer hover:bg-indigo-500/60"
                style={{
                  left: `${(i * 30) + 10}%`,
                  width: "25%",
                }}
              >
                {cap.text}
              </div>
            ))}
          </div>

          {/* TRACK 3: Scenes Track */}
          <div className="h-6 w-full rounded-lg bg-secondary/20 border border-white/5 relative flex items-center px-2">
            <span className="absolute left-2 top-0.5 text-[8px] uppercase font-bold text-purple-400">Scenes</span>
            {scenes.map((scene, i) => (
              <div
                key={scene.id}
                className="absolute inset-y-1 bg-purple-500/40 border border-purple-400 rounded px-2 flex items-center text-[9px] font-bold text-purple-200 truncate hover:bg-purple-500/60"
                style={{
                  left: `${(i * 25) + 5}%`,
                  width: "22%",
                }}
              >
                #{i + 1} {scene.prompt}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* 4. Export & Rendering Dialog Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-md" onClose={() => setIsExportModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editorT("exportTitle")}</DialogTitle>
            <DialogDescription>{editorT("exportDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-secondary/40 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Composition Format:</span>
                <span className="font-bold text-foreground">9:16 Vertical Reel</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-bold text-foreground">{selectedDuration.toFixed(1)} seconds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output Engine:</span>
                <span className="font-bold text-rose-400">Remotion 4.x Headless</span>
              </div>
            </div>

            {isRendering && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Rendering video frames...</span>
                  <span>{renderProgress}%</span>
                </div>
                <Progress value={renderProgress} />
              </div>
            )}

            {renderFinished && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center">
                ✓ Render finished! Your video is ready to download.
              </div>
            )}
          </div>

          <DialogFooter>
            {!renderFinished ? (
              <Button
                variant="gradient"
                onClick={handleStartRender}
                disabled={isRendering}
                className="w-full rounded-xl font-bold"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Rendering {renderProgress}%
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    {editorT("startExport")}
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={() => setIsExportModalOpen(false)}
                className="w-full rounded-xl font-bold"
              >
                <Download className="h-4 w-4 mr-2" />
                {editorT("downloadReady")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
