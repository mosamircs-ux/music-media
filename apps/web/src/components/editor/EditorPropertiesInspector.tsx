"use client";

import * as React from "react";
import {
  Sliders,
  Captions as CaptionsIcon,
  Trash2,
  Copy,
  Split,
} from "lucide-react";
import { Button, Input, Slider } from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import {
  type TransitionType,
  type VisualStyle,
  type CaptionPresetStyle,
  type CaptionAnimation,
} from "@musicmotion/shared";
import { SceneGenerationPanel } from "../SceneGenerationPanel";

export interface EditorPropertiesInspectorProps {
  className?: string;
}

const TRANSITION_TYPES: Array<{ value: TransitionType; label: string }> = [
  { value: "fade", label: "Smooth Crossfade" },
  { value: "dissolve", label: "Film Dissolve" },
  { value: "slide_left", label: "Slide Left" },
  { value: "slide_right", label: "Slide Right" },
  { value: "zoom_in", label: "Dynamic Zoom In" },
  { value: "zoom_out", label: "Dynamic Zoom Out" },
  { value: "glitch", label: "Cyber Glitch" },
  { value: "cut", label: "Hard Cut" },
];

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

const CAPTION_STYLES: CaptionPresetStyle[] = [
  "Modern",
  "Minimal",
  "Karaoke",
  "Cinematic",
  "Neon",
  "Bold",
  "Typewriter",
  "Elegant",
];

const CAPTION_ANIMATIONS: CaptionAnimation[] = [
  "Pop",
  "Fade",
  "Slide Up",
  "Slide Down",
  "Typewriter",
  "Word-by-word",
  "Karaoke",
];

const CAMERA_PRESETS = [
  "Cinematic Slow Pan",
  "Dynamic Zoom In",
  "Drone Aerial View",
  "Low Angle Hero Shot",
  "Close-up Portrait",
  "Orbital Rotation",
  "Static Framed",
];

export function EditorPropertiesInspector({ className = "" }: EditorPropertiesInspectorProps) {
  const {
    currentProject,
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    selectedElement,
    updateScene,
    resizeSceneDuration,
    removeScene,
    updateCaption,
    updateCaptionTiming,
    removeCaption,
    duplicateCaption,
    splitCaption,
    updateSelection,
  } = useProjectStore();

  const selectedScene = React.useMemo(() => {
    if (selectedElement.type === "scene" && selectedElement.id) {
      return scenes.find((s) => s.id === selectedElement.id);
    }
    return undefined;
  }, [selectedElement, scenes]);

  const selectedCaption = React.useMemo(() => {
    if (selectedElement.type === "caption" && selectedElement.id) {
      return captions.find((c) => c.id === selectedElement.id);
    }
    return undefined;
  }, [selectedElement, captions]);

  return (
    <aside
      className={`w-80 sm:w-88 flex flex-col border-l border-border/40 bg-card/50 backdrop-blur-xl overflow-y-auto p-4 space-y-5 flex-shrink-0 ${className}`}
    >
      {/* ── 1. SCENE INSPECTOR ─────────────────────────────────── */}
      {selectedElement.type === "scene" && selectedScene && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center">
                {selectedScene.order + 1}
              </span>
              <h3 className="text-xs font-bold text-foreground">Scene {selectedScene.order + 1} Inspector</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeScene(selectedScene.id)}
              className="h-7 text-xs text-muted-foreground hover:text-rose-400 p-1.5"
              title="Delete Scene"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Visual Generation Panel */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground block">Scene Visual</span>
            <SceneGenerationPanel
              scene={selectedScene}
              projectId={currentProject?.id || "project-editor"}
              visualStyle={selectedScene.visualStyle}
            />
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Prompt Concept</label>
            <textarea
              rows={3}
              value={selectedScene.prompt}
              onChange={(e) => updateScene(selectedScene.id, { prompt: e.target.value })}
              placeholder="Describe the visual scene..."
              className="w-full text-xs bg-background/80 border border-white/10 rounded-xl p-2.5 text-foreground resize-none focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Visual Style Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Visual Style</label>
            <select
              value={selectedScene.visualStyle || "Cinematic"}
              onChange={(e) => updateScene(selectedScene.id, { visualStyle: e.target.value as VisualStyle })}
              className="w-full h-8 bg-background/80 border border-white/10 rounded-xl px-2.5 text-xs text-foreground font-medium"
            >
              {VISUAL_STYLES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Camera Movement Preset */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Camera Motion</label>
            <select
              value={selectedScene.camera || CAMERA_PRESETS[0]}
              onChange={(e) => updateScene(selectedScene.id, { camera: e.target.value })}
              className="w-full h-8 bg-background/80 border border-white/10 rounded-xl px-2.5 text-xs text-foreground font-medium"
            >
              {CAMERA_PRESETS.map((cam) => (
                <option key={cam} value={cam}>
                  {cam}
                </option>
              ))}
            </select>
          </div>

          {/* Transition Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Transition Effect</label>
            <select
              value={selectedScene.transition?.type || "fade"}
              onChange={(e) =>
                updateScene(selectedScene.id, {
                  transition: {
                    type: e.target.value as TransitionType,
                    duration: selectedScene.transition?.duration || 0.5,
                  },
                })
              }
              className="w-full h-8 bg-background/80 border border-white/10 rounded-xl px-2.5 text-xs text-foreground font-medium"
            >
              {TRANSITION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Scene Duration</span>
              <span className="font-mono text-purple-300 font-bold">{selectedScene.duration.toFixed(1)}s</span>
            </div>
            <Slider
              value={selectedScene.duration}
              min={1}
              max={15}
              step={0.5}
              onChange={(val) => resizeSceneDuration(selectedScene.id, val)}
            />
          </div>
        </div>
      )}

      {/* ── 2. CAPTION INSPECTOR ──────────────────────────────── */}
      {selectedElement.type === "caption" && selectedCaption && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <CaptionsIcon className="h-4 w-4 text-indigo-400" />
              <h3 className="text-xs font-bold text-foreground">Caption Inspector</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateCaption(selectedCaption.id)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground p-1.5"
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => splitCaption(selectedCaption.id)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground p-1.5"
                title="Split"
              >
                <Split className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCaption(selectedCaption.id)}
                className="h-7 text-xs text-muted-foreground hover:text-rose-400 p-1.5"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Caption Text</label>
            <textarea
              rows={3}
              value={selectedCaption.text}
              onChange={(e) => updateCaption(selectedCaption.id, { text: e.target.value })}
              className="w-full text-xs bg-background/80 border border-white/10 rounded-xl p-2.5 text-foreground resize-none focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              dir={selectedCaption.isRTL ? "rtl" : "ltr"}
            />
          </div>

          {/* Timing Controls */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Start (s)</label>
              <Input
                type="number"
                step="0.1"
                value={selectedCaption.startTime}
                onChange={(e) => updateCaptionTiming(selectedCaption.id, parseFloat(e.target.value) || 0, selectedCaption.endTime)}
                className="h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">End (s)</label>
              <Input
                type="number"
                step="0.1"
                value={selectedCaption.endTime}
                onChange={(e) => updateCaptionTiming(selectedCaption.id, selectedCaption.startTime, parseFloat(e.target.value) || 0)}
                className="h-8 text-xs bg-background/80"
              />
            </div>
          </div>

          {/* Preset Style Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Typography Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {CAPTION_STYLES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => updateCaption(selectedCaption.id, { style: st })}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                    selectedCaption.style === st
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-muted-foreground block">Motion Animation</label>
            <select
              value={selectedCaption.animation || "Pop"}
              onChange={(e) => updateCaption(selectedCaption.id, { animation: e.target.value as CaptionAnimation })}
              className="w-full h-8 bg-background/80 border border-white/10 rounded-xl px-2.5 text-xs text-foreground font-medium"
            >
              {CAPTION_ANIMATIONS.map((anim) => (
                <option key={anim} value={anim}>
                  {anim}
                </option>
              ))}
            </select>
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Font Size</span>
              <span className="font-mono text-indigo-300 font-bold">{selectedCaption.fontSize || 42}px</span>
            </div>
            <Slider
              value={selectedCaption.fontSize || 42}
              min={24}
              max={72}
              step={2}
              onChange={(val) => updateCaption(selectedCaption.id, { fontSize: val })}
            />
          </div>
        </div>
      )}

      {/* ── 3. DEFAULT: AUDIO & PROJECT INSPECTOR ─────────────── */}
      {(!selectedElement.type || selectedElement.type === "track" || selectedElement.type === "overlay") && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Sliders className="h-4 w-4 text-rose-400" />
            <h3 className="font-bold text-foreground">Project & Audio Settings</h3>
          </div>

          {/* Active Audio Track info */}
          {selectedTrack && (
            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Selected Music
              </span>
              <h4 className="font-bold text-foreground truncate">{selectedTrack.title}</h4>
              <p className="text-[11px] text-muted-foreground truncate">{selectedTrack.artist}</p>
            </div>
          )}

          {/* Selection Start/End Controls */}
          {trackSelection && (
            <div className="space-y-2">
              <span className="font-bold text-foreground block">Audio Timeline Range</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Start (s)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={trackSelection.startTime}
                    onChange={(e) => updateSelection(parseFloat(e.target.value) || 0, trackSelection.endTime)}
                    className="h-8 text-xs bg-background/80"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-1">End (s)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={trackSelection.endTime}
                    onChange={(e) => updateSelection(trackSelection.startTime, parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs bg-background/80"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Composition Specs */}
          <div className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
              Output Specs
            </span>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Canvas Resolution</span>
              <span className="font-bold text-zinc-200">1080 × 1920 (9:16)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Frame Rate</span>
              <span className="font-bold text-zinc-200">30 FPS</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">Video Codec</span>
              <span className="font-bold text-zinc-200">H.264 (AAC Audio)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}