"use client";

import * as React from "react";
import {
  Sparkles,
  Wand2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Video,
  Camera,
  ImagePlay,
} from "lucide-react";
import { Button, Input, Badge } from "@musicmotion/ui";

import {
  formatTime,
  type NormalizedTrack,
  type VisualStyle,
  type ScenePlan,
  type Scene,
  type TransitionType,
} from "@musicmotion/shared";
import { useProjectStore } from "@/stores/projectStore";
import { aiScenePlanner } from "@musicmotion/ai";
import { SceneGenerationPanel } from "./SceneGenerationPanel";

export interface ScenePlannerProps {
  track?: NormalizedTrack;
  projectId?: string;
  startTime?: number;
  endTime?: number;
  totalDuration?: number;
  className?: string;
}

const VISUAL_STYLES: VisualStyle[] = [
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

const TRANSITION_TYPES: Array<{ value: TransitionType; label: string }> = [
  { value: "fade", label: "Fade" },
  { value: "dissolve", label: "Dissolve" },
  { value: "zoom_in", label: "Zoom In" },
  { value: "zoom_out", label: "Zoom Out" },
  { value: "slide_left", label: "Slide Left" },
  { value: "slide_right", label: "Slide Right" },
  { value: "glitch", label: "Glitch" },
  { value: "cut", label: "Hard Cut" },
];

export function ScenePlanner({
  track,
  projectId = "dev-project",
  startTime = 0,
  endTime = 15,
  totalDuration = 15,
  className = "",
}: ScenePlannerProps) {
  const {
    scenes,
    captions,
    addScene,
    updateScene,
    removeScene,
    reorderScenes,
    applyScenePlan,
  } = useProjectStore();

  const [visualStyle, setVisualStyle] = React.useState<VisualStyle>("Cinematic");
  const [userStoryPrompt, setUserStoryPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [activePlan, setActivePlan] = React.useState<ScenePlan | null>(null);
  const [regeneratingId, setRegeneratingId] = React.useState<string | null>(null);
  const [newScenePrompt, setNewScenePrompt] = React.useState("");

  // Handler: Generate full multi-scene story
  const handleGenerateStory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!track) return;

    setIsGenerating(true);
    try {
      // Call server route or client orchestrator
      const response = await fetch("/api/ai/scene-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          startTime,
          endTime,
          duration: totalDuration,
          visualStyle,
          userDescription: userStoryPrompt.trim(),
          captions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.plan) {
          setActivePlan(data.plan);
          applyScenePlan(data.plan);
        }
      } else {
        // Client fallback execution
        const fallbackPlan = await aiScenePlanner.generateScenePlanWithFallback({
          track,
          startTime,
          endTime,
          duration: totalDuration,
          visualStyle,
          userDescription: userStoryPrompt.trim(),
          captions,
        });
        setActivePlan(fallbackPlan);
        applyScenePlan(fallbackPlan);
      }
    } catch (err) {
      console.error("Story generation error:", err);
      // Fallback on error
      const fallbackPlan = await aiScenePlanner.generateScenePlanWithFallback({
        track,
        startTime,
        endTime,
        duration: totalDuration,
        visualStyle,
        userDescription: userStoryPrompt.trim(),
        captions,
      });
      setActivePlan(fallbackPlan);
      applyScenePlan(fallbackPlan);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Regenerate single scene prompt
  const handleRegenerateScenePrompt = async (scene: Scene, index: number) => {
    if (!track) return;
    setRegeneratingId(scene.id);
    try {
      const newPrompt = await aiScenePlanner.generateVisualPrompt({
        track,
        visualStyle: scene.visualStyle || visualStyle,
        sceneIndex: index,
        totalScenes: Math.max(1, scenes.length),
        camera: scene.camera,
        continuityGuidelines: activePlan?.continuityGuidelines,
      });

      updateScene(scene.id, { prompt: newPrompt });
    } catch (err) {
      console.error("Failed to regenerate scene prompt:", err);
    } finally {
      setRegeneratingId(null);
    }
  };

  // Handler: Manual add scene
  const handleManualAddScene = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newScenePrompt.trim()) return;

    const currentScenesCount = scenes.length;
    const dur = Math.max(2, Math.round(totalDuration / Math.max(1, currentScenesCount + 1)));

    addScene(newScenePrompt.trim(), dur, {
      visualStyle,
      camera: "Slow Dolly In",
      mood: visualStyle,
    });

    setNewScenePrompt("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. TOP STORY GENERATOR TOOLBAR */}
      <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-bold text-foreground">AI Scene Storyboard Planner</h4>
          </div>
          <Badge variant="accent" className="text-[10px]">
            {scenes.length} {scenes.length === 1 ? "Scene" : "Scenes"} ({formatTime(totalDuration)})
          </Badge>
        </div>

        {/* Visual Style Selection Pills */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-muted-foreground block">
            Visual Art Style Preset
          </label>
          <div className="flex flex-wrap gap-1.5">
            {VISUAL_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setVisualStyle(style)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                  visualStyle === style
                    ? "bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/30"
                    : "bg-secondary/40 border-white/5 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Creative Story Prompt Input & Trigger */}
        <div className="space-y-2 pt-1">
          <Input
            value={userStoryPrompt}
            onChange={(e) => setUserStoryPrompt(e.target.value)}
            placeholder="Describe story, world or character (e.g., Cyberpunk samurai racing through neon rain)..."
            className="h-9 text-xs rounded-xl bg-background/80 border-white/10"
          />

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={() => handleGenerateStory()}
            disabled={isGenerating || !track}
            className="w-full h-9 rounded-xl font-bold text-xs shadow-md shadow-rose-500/20"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Analyzing Music & Planning Story...
              </>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Generate Story
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 2. ACTIVE STORY OVERVIEW (If generated) */}
      {activePlan && (
        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 truncate">{activePlan.title}</span>
            <div className="flex items-center gap-1">
              {activePlan.colorPalette.map((c, i) => (
                <span
                  key={i}
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            {activePlan.visualConcept}
          </p>
        </div>
      )}

      {/* 3. SCENES TIMELINE LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
          <span>Storyboard Scenes</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono">0:00 ─── {formatTime(totalDuration)}</span>
            {scenes.length > 0 && (
              <button
                type="button"
                title="Generate visuals for all scenes"
                className="flex items-center gap-1 text-[10px] font-semibold bg-purple-500/15 border border-purple-500/25 text-purple-300 px-2 py-0.5 rounded-lg hover:bg-purple-500/25 transition-all"
                onClick={() => {
                  scenes.forEach((scene) => {
                    fetch("/api/generate/scene", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        projectId,
                        scenes: [{ sceneId: scene.id, prompt: scene.prompt, visualStyle }],
                      }),
                    }).catch(console.error);
                  });
                }}
              >
                <ImagePlay className="h-3 w-3" />
                Generate All
              </button>
            )}
          </div>
        </div>

        {scenes.length === 0 ? (
          <div className="p-8 rounded-2xl bg-secondary/20 border border-dashed border-white/10 text-center space-y-2">
            <Video className="h-7 w-7 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              No scenes planned yet. Click <span className="font-bold text-foreground">Generate Story</span> above to create an AI storyboard.
            </p>
          </div>
        ) : (
          scenes.map((scene, index) => {
            const start = scene.startTime ?? index * (totalDuration / scenes.length);
            const end = scene.endTime ?? start + scene.duration;

            return (
              <div
                key={scene.id}
                className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 hover:bg-secondary/40 transition-all space-y-2.5"
              >
                {/* Scene Header with Timing & Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-lg bg-purple-500/20 text-purple-300 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      Scene {index + 1}
                    </span>
                    <span className="text-[10px] font-mono bg-background/60 px-1.5 py-0.5 rounded text-indigo-300 border border-white/5">
                      {formatTime(start)} → {formatTime(end)}
                    </span>
                  </div>

                  {/* Ordering and Actions */}
                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => reorderScenes(index, index - 1)}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-white/5"
                      title="Move Scene Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === scenes.length - 1}
                      onClick={() => reorderScenes(index, index + 1)}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded hover:bg-white/5"
                      title="Move Scene Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Regenerate prompt */}
                    <button
                      type="button"
                      disabled={regeneratingId === scene.id}
                      onClick={() => handleRegenerateScenePrompt(scene, index)}
                      className="p-1 text-purple-400 hover:text-purple-300 rounded hover:bg-white/5"
                      title="Regenerate Scene Prompt"
                    >
                      <Wand2
                        className={`h-3.5 w-3.5 ${
                          regeneratingId === scene.id ? "animate-spin" : ""
                        }`}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeScene(scene.id)}
                      className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-white/5"
                      title="Delete Scene"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editable Prompt */}
                <textarea
                  rows={2}
                  value={scene.prompt}
                  onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                  placeholder="Enter detailed prompt for this visual scene..."
                  className="w-full text-xs font-medium bg-background/60 border border-white/5 rounded-xl p-2.5 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
                />

                {/* Badges & Transition Selector */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {scene.camera && (
                      <span className="bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {scene.camera}
                      </span>
                    )}
                    {scene.mood && (
                      <span className="bg-rose-500/15 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg">
                        {scene.mood}
                      </span>
                    )}
                  </div>

                  {/* Transition Picker */}
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Transition:</span>
                    <select
                      value={scene.transition?.type || "fade"}
                      onChange={(e) =>
                        updateScene(scene.id, {
                          transition: {
                            type: e.target.value as TransitionType,
                            duration: 0.5,
                          },
                        })
                      }
                      className="bg-background/80 text-[10px] font-semibold rounded-lg border border-white/10 px-2 py-0.5 text-foreground"
                    >
                      {TRANSITION_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visual Generation Panel */}
                <SceneGenerationPanel
                  scene={scene}
                  projectId={projectId}
                  visualStyle={visualStyle}
                />
              </div>
            );
          })
        )}
      </div>

      {/* 4. MANUAL ADD SCENE */}
      <form onSubmit={handleManualAddScene} className="flex gap-2 pt-1">
        <Input
          value={newScenePrompt}
          onChange={(e) => setNewScenePrompt(e.target.value)}
          placeholder="Add custom scene prompt manually..."
          className="h-9 text-xs rounded-xl bg-secondary/40 border-white/10"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={!newScenePrompt.trim()}
          className="h-9 px-4 rounded-xl font-bold text-xs flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Scene
        </Button>
      </form>
    </div>
  );
}
