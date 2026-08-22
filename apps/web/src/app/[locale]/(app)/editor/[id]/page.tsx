"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Play,
  Pause,
  Scissors,
  Sparkles,
  Captions as CaptionsIcon,
  Video,
  Layers,
  Plus,
  Trash2,
  Download,
  Settings2,
  Music2,
  RefreshCw,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge } from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime } from "@musicmotion/shared";

export default function EditorStudioPage() {
  const t = useTranslations("editor");
  const musicT = useTranslations("music");
  const captionsT = useTranslations("captions");
  const scenesT = useTranslations("scenes");

  const {
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    videoConfig,
    isPlaying,
    currentTime,
    updateSelection,
    addCaption,
    removeCaption,
    addScene,
    removeScene,
    setIsPlaying,
  } = useProjectStore();

  const [activeTab, setActiveTab] = React.useState<"music" | "scenes" | "captions">("music");
  const [newCaptionText, setNewCaptionText] = React.useState("");
  const [newScenePrompt, setNewScenePrompt] = React.useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = React.useState(false);
  const [isRendering, setIsRendering] = React.useState(false);
  const [renderProgress, setRenderProgress] = React.useState(0);

  // Default track fallback if opened directly
  const track = selectedTrack || {
    id: "jamendo-demo",
    provider: "jamendo" as const,
    externalId: "demo-1",
    title: "Synthwave Sunset Horizon",
    artist: "Cyber Waves",
    duration: 180,
    audioUrl: "https://prod-1.storage.jamendo.com/download/track/101/mp32/",
    license: {
      type: "Creative Commons BY 4.0",
      attributionRequired: true,
      commercialAllowed: true,
    },
  };

  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const duration = endTime - startTime;

  const handleAddCaption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaptionText.trim()) return;
    addCaption(newCaptionText, 0, Math.min(5, duration));
    setNewCaptionText("");
  };

  const handleAddScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScenePrompt.trim()) return;
    addScene(newScenePrompt, 5);
    setNewScenePrompt("");
  };

  const handleEnhancePrompt = async () => {
    if (!newScenePrompt.trim()) return;
    setIsEnhancingPrompt(true);
    // Simulate AI prompt enhancement via abstraction
    setTimeout(() => {
      setNewScenePrompt(
        `Cinematic neon-lit cyberpunk cityscape reflecting rainy streets, moody synth atmosphere, 9:16 vertical composition, 8k render`
      );
      setIsEnhancingPrompt(false);
    }, 800);
  };

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(10);
    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          return 100;
        }
        return prev + 15;
      });
    }, 500);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{track.title}</h1>
            <Badge variant="accent">9:16 Reel Mode</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {track.artist} • Section Duration: {formatTime(duration)} ({duration.toFixed(1)}s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gradient"
            size="sm"
            onClick={handleStartRender}
            disabled={isRendering}
            className="rounded-xl font-bold shadow-md shadow-rose-500/20"
          >
            {isRendering ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Rendering {renderProgress}%
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Export 9:16 MP4
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Studio Workspace: Left Controls (Tabs) | Right Video Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Editing Controls & Tabs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Selection */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-secondary/40 border border-white/5">
            <button
              onClick={() => setActiveTab("music")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "music"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Music2 className="h-4 w-4" />
              <span>Music & Waveform</span>
            </button>
            <button
              onClick={() => setActiveTab("scenes")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "scenes"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Visual Scenes ({scenes.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("captions")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "captions"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CaptionsIcon className="h-4 w-4" />
              <span>Captions ({captions.length})</span>
            </button>
          </div>

          {/* TAB 1: MUSIC & WAVEFORM */}
          {activeTab === "music" && (
            <Card className="border-white/10 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-rose-500" />
                  <span>Audio Trimming & Waveform Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Waveform Visualization */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Start: {formatTime(startTime)}</span>
                    <span className="font-bold text-rose-400">
                      Loop: {formatTime(duration)}
                    </span>
                    <span>End: {formatTime(endTime)}</span>
                  </div>

                  <div className="h-24 w-full rounded-xl bg-background border border-white/10 flex items-center justify-between px-3 gap-1 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 bg-rose-500/20 border-x-2 border-rose-500 flex items-center justify-center transition-all"
                      style={{
                        left: `${(startTime / track.duration) * 100}%`,
                        width: `${(duration / track.duration) * 100}%`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-rose-300 bg-black/70 px-2 py-0.5 rounded">
                        Active Selection
                      </span>
                    </div>

                    {Array.from({ length: 54 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-muted-foreground/30 rounded-full"
                        style={{ height: `${20 + Math.sin(i * 0.35) * 40 + Math.random() * 25}%` }}
                      />
                    ))}
                  </div>

                  {/* Trimmer Sliders */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        Start Offset (s)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max={track.duration - 1}
                        value={startTime}
                        onChange={(e) => updateSelection(Number(e.target.value), endTime)}
                        className="h-9 bg-background/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1">
                        End Offset (s)
                      </label>
                      <Input
                        type="number"
                        min={startTime + 1}
                        max={track.duration}
                        value={endTime}
                        onChange={(e) => updateSelection(startTime, Number(e.target.value))}
                        className="h-9 bg-background/50"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: AI SCENES */}
          {activeTab === "scenes" && (
            <Card className="border-white/10 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>AI Visual Scene Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddScene} className="space-y-3">
                  <div className="relative">
                    <Input
                      value={newScenePrompt}
                      onChange={(e) => setNewScenePrompt(e.target.value)}
                      placeholder={scenesT("generatePrompt")}
                      className="h-11 bg-background/50 pr-24 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancingPrompt || !newScenePrompt.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 text-[11px] font-semibold rounded-lg border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Enhance
                    </Button>
                  </div>
                  <Button type="submit" variant="gradient" size="sm" className="w-full rounded-xl">
                    <Plus className="h-4 w-4 mr-1.5" /> Add Scene to Timeline
                  </Button>
                </form>

                {/* Scene List */}
                <div className="space-y-2 pt-2">
                  {scenes.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No scenes added yet. Enter a prompt above to generate your first scene.
                    </p>
                  ) : (
                    scenes.map((scene, idx) => (
                      <div
                        key={scene.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-purple-400">#{idx + 1}</span>
                          <span className="text-xs font-medium text-foreground max-w-sm truncate">
                            {scene.prompt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {scene.duration}s
                          </Badge>
                          <button
                            onClick={() => removeScene(scene.id)}
                            className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: CAPTIONS */}
          {activeTab === "captions" && (
            <Card className="border-white/10 bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CaptionsIcon className="h-4 w-4 text-indigo-400" />
                  <span>Timed Animated Captions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAddCaption} className="flex gap-2">
                  <Input
                    value={newCaptionText}
                    onChange={(e) => setNewCaptionText(e.target.value)}
                    placeholder={captionsT("placeholder")}
                    className="h-10 bg-background/50 rounded-xl"
                  />
                  <Button type="submit" variant="gradient" size="sm" className="rounded-xl px-4">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </form>

                {/* Captions List */}
                <div className="space-y-2 pt-2">
                  {captions.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No captions added yet. Add lyrics or punchlines to sync with the music beat.
                    </p>
                  ) : (
                    captions.map((cap) => (
                      <div
                        key={cap.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-white/5"
                      >
                        <span className="text-xs font-semibold text-foreground">{cap.text}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="accent" className="text-[10px]">
                            {cap.style?.animation || "pop"}
                          </Badge>
                          <button
                            onClick={() => removeCaption(cap.id)}
                            className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 5 Columns: Remotion Live Phone Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] rounded-[40px] bg-neutral-950 border-[6px] border-neutral-800 shadow-2xl p-4 space-y-4 relative overflow-hidden">
            {/* Phone Top Notch */}
            <div className="flex justify-between items-center px-4 pt-1 text-[11px] text-white/70">
              <span className="font-semibold">12:00</span>
              <div className="h-4 w-20 bg-neutral-800 rounded-full" />
              <span>5G</span>
            </div>

            {/* Video Screen Container (9:16 Aspect Ratio) */}
            <div className="relative aspect-[9/16] w-full rounded-2xl bg-neutral-900 overflow-hidden flex flex-col justify-between p-4 border border-white/10 shadow-inner">
              {/* Dynamic Scene Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-neutral-950 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-purple-500/20 animate-pulse" />
              </div>

              {/* Watermark */}
              <div className="relative z-10 self-end">
                <span className="text-[10px] font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                  MusicMotion
                </span>
              </div>

              {/* Live Animated Caption Display */}
              <div className="relative z-10 text-center">
                {captions.length > 0 ? (
                  <div className="inline-block bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20 text-white font-extrabold text-sm shadow-xl">
                    {captions[0].text}
                  </div>
                ) : (
                  <div className="inline-block bg-black/50 px-3 py-1 rounded-lg text-white/50 text-xs">
                    Captions Preview
                  </div>
                )}
              </div>

              {/* Bottom Track Meta */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-white/70">
                <span className="font-semibold truncate max-w-[140px]">🎵 {track.title}</span>
                <span className="text-rose-400 font-bold">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Preview Playback Controls */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="gradient"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-12 w-12 rounded-full shadow-lg shadow-rose-500/30"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
