"use client";

import * as React from "react";
import {
  Plus,
  Trash2,
  Copy,
  Scissors,
  Combine,
  Type,
  Languages,
  ShieldAlert,
  Wand2,
} from "lucide-react";
import { Button, Input } from "@musicmotion/ui";

import {
  formatTime,
  isRTLText,
  type Caption,
  type CaptionPresetStyle,
  type CaptionAnimation,
  type CaptionPosition,
  type NormalizedTrack,

} from "@musicmotion/shared";
import { useProjectStore } from "@/stores/projectStore";
import { autoCaptions } from "@musicmotion/ai";

export interface CaptionEditorProps {
  track?: NormalizedTrack;
  currentTime?: number;
  totalDuration?: number;
  onPreviewCaption?: (caption: Caption) => void;
  className?: string;
}

const PRESET_STYLES: CaptionPresetStyle[] = [
  "Modern",
  "Minimal",
  "Karaoke",
  "Cinematic",
  "Neon",
  "Bold",
  "Typewriter",
  "Elegant",
];

const ANIMATION_TYPES: CaptionAnimation[] = [
  "Pop",
  "Fade",
  "Slide Up",
  "Slide Down",
  "Typewriter",
  "Word-by-word",
  "Karaoke",
];

export function CaptionEditor({
  track,
  currentTime = 0,
  totalDuration = 15,
  onPreviewCaption,
  className = "",
}: CaptionEditorProps) {
  const {
    captions,
    addCaption,
    updateCaption,
    removeCaption,
    duplicateCaption,
    splitCaption,
    mergeCaptions,
    setAllCaptionsStyle,
    setCaptions,
  } = useProjectStore();

  const [newText, setNewText] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState<CaptionPresetStyle>("Modern");
  const [activeCaptionId, setActiveCaptionId] = React.useState<string | null>(null);
  const [showSafeZones, setShowSafeZones] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [autoLanguage, setAutoLanguage] = React.useState<string>("auto");

  // Add caption handler
  const handleAddCaption = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newText.trim()) return;

    const start = Math.round(currentTime * 10) / 10;
    const end = Math.min(totalDuration, Math.round((start + 3.0) * 10) / 10);
    const isRTL = isRTLText(newText);

    addCaption(newText.trim(), start, end, {
      style: selectedStyle,
      animation: "Pop",
      position: "bottom",
      alignment: isRTL ? "right" : "center",
      isRTL,
    });

    setNewText("");
  };

  // Auto-generate captions using autoCaptions abstraction
  const handleAutoGenerate = async () => {
    if (!track) return;
    setIsGenerating(true);
    try {
      const res = await autoCaptions.generateCaptionsWithFallback(track, {
        duration: totalDuration,
        style: selectedStyle,
        language: autoLanguage === "ar" ? "ar" : "en",
      });


      if (res.captions.length > 0) {
        setCaptions(res.captions);
      }
    } catch (err) {
      console.error("Failed to generate auto-captions:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. TOP TOOLBAR: Quick Style Presets & Auto-Generate */}
      <div className="p-3 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold text-foreground">Global Caption Styles</h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSafeZones(!showSafeZones)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                showSafeZones
                  ? "bg-rose-500/20 border-rose-500 text-rose-300"
                  : "bg-secondary/40 border-white/5 text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle 9:16 Vertical Safe Zones Overlay"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>Safe Zones</span>
            </button>
          </div>
        </div>

        {/* Style Preset Selector Pills */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => {
                setSelectedStyle(style);
                setAllCaptionsStyle(style);
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                selectedStyle === style
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30"
                  : "bg-secondary/40 border-white/5 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {style}
            </button>
          ))}
        </div>

        {/* AI Auto-Caption Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={autoLanguage}
              onChange={(e) => setAutoLanguage(e.target.value)}
              className="bg-background/80 text-[10px] rounded-lg border border-white/10 px-2 py-1 text-foreground"
            >
              <option value="auto">Auto Language</option>
              <option value="en">English (LTR)</option>
              <option value="ar">العربية Arabic (RTL)</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAutoGenerate()}
            disabled={isGenerating || !track}
            className="h-7 text-[10px] font-bold rounded-lg border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
          >
            <Wand2 className="h-3 w-3 mr-1" />
            {isGenerating ? "Generating..." : "Auto-Sync Lyrics"}
          </Button>
        </div>
      </div>

      {/* 2. ADD CAPTION INPUT */}
      <form onSubmit={handleAddCaption} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type lyrics or captions (supports Arabic / RTL)..."
            dir={isRTLText(newText) ? "rtl" : "ltr"}
            className="h-9 text-xs rounded-xl bg-secondary/40 border-white/10"
          />
          <Button
            type="submit"
            variant="gradient"
            size="sm"
            disabled={!newText.trim()}
            className="h-9 px-4 rounded-xl font-bold text-xs flex-shrink-0 shadow-md shadow-rose-500/20"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        </div>
      </form>

      {/* 3. CAPTION LIST & TIMELINE TRACKS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
          <span>Timed Captions ({captions.length})</span>
          <span className="text-[10px] font-mono">00:00 ─── {formatTime(totalDuration)}</span>
        </div>

        {captions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-secondary/20 border border-dashed border-white/10 text-center space-y-2">
            <Type className="h-6 w-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No captions yet. Type a line above or click Auto-Sync Lyrics.</p>
          </div>
        ) : (
          captions.map((cap, index) => {
            const isRTL = cap.isRTL ?? isRTLText(cap.text);
            const isSelected = activeCaptionId === cap.id;

            return (
              <div
                key={cap.id}
                onClick={() => {
                  setActiveCaptionId(cap.id);
                  if (onPreviewCaption) onPreviewCaption(cap);
                }}
                className={`p-3 rounded-2xl border transition-all space-y-2 ${
                  isSelected
                    ? "bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/40"
                    : "bg-secondary/30 border-white/5 hover:bg-secondary/50"
                }`}
              >
                {/* Header: Timeline Badge & Operations */}
                <div className="flex items-center justify-between text-xs font-mono">
                  {/* Timeline segment: 00:42 ─────── 00:47 */}
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px]">
                    <span className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-[10px]">
                      {formatTime(cap.startTime)}
                    </span>
                    <span className="text-muted-foreground">───────</span>
                    <span className="bg-indigo-500/20 px-1.5 py-0.5 rounded text-[10px]">
                      {formatTime(cap.endTime)}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({(cap.endTime - cap.startTime).toFixed(1)}s)
                    </span>
                  </div>

                  {/* Operation Buttons: Split, Merge, Duplicate, Delete */}
                  <div className="flex items-center gap-1">
                    {/* Split */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        splitCaption(cap.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-indigo-300 rounded hover:bg-white/5"
                      title="Split Caption"
                    >
                      <Scissors className="h-3.5 w-3.5" />
                    </button>

                    {/* Merge with next */}
                    {index < captions.length - 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeCaptions(cap.id, captions[index + 1].id);
                        }}
                        className="p-1 text-muted-foreground hover:text-emerald-400 rounded hover:bg-white/5"
                        title="Merge with Next"
                      >
                        <Combine className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateCaption(cap.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-purple-400 rounded hover:bg-white/5"
                      title="Duplicate Caption"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCaption(cap.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-white/5"
                      title="Delete Caption"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Text Input */}
                <input
                  type="text"
                  value={cap.text}
                  dir={isRTL ? "rtl" : "ltr"}
                  onChange={(e) => updateCaption(cap.id, { text: e.target.value })}
                  className="w-full text-xs font-semibold bg-background/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-foreground"
                />

                {/* Expanded Controls for Selected Caption */}
                {isSelected && (
                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    {/* Style */}
                    <div>
                      <label className="text-muted-foreground block mb-0.5">Style</label>
                      <select
                        value={cap.style || "Modern"}
                        onChange={(e) => updateCaption(cap.id, { style: e.target.value as CaptionPresetStyle })}
                        className="w-full bg-secondary/80 border border-white/10 rounded-lg p-1 text-foreground"
                      >
                        {PRESET_STYLES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Animation */}
                    <div>
                      <label className="text-muted-foreground block mb-0.5">Animation</label>
                      <select
                        value={cap.animation || "Pop"}
                        onChange={(e) => updateCaption(cap.id, { animation: e.target.value as CaptionAnimation })}
                        className="w-full bg-secondary/80 border border-white/10 rounded-lg p-1 text-foreground"
                      >
                        {ANIMATION_TYPES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>

                    {/* Position */}
                    <div>
                      <label className="text-muted-foreground block mb-0.5">Position</label>
                      <select
                        value={cap.position || "bottom"}
                        onChange={(e) => updateCaption(cap.id, { position: e.target.value as CaptionPosition })}
                        className="w-full bg-secondary/80 border border-white/10 rounded-lg p-1 text-foreground"
                      >
                        <option value="top">Top (15%)</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom (20%)</option>
                      </select>
                    </div>

                    {/* Timing Adjusters */}
                    <div>
                      <label className="text-muted-foreground block mb-0.5">Start / End</label>
                      <div className="flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="0.1"
                          value={cap.startTime}
                          onChange={(e) => updateCaption(cap.id, { startTime: Number(e.target.value) })}
                          className="w-1/2 bg-background/60 border border-white/10 rounded p-0.5 text-center text-rose-300"
                        />
                        <input
                          type="number"
                          step="0.1"
                          value={cap.endTime}
                          onChange={(e) => updateCaption(cap.id, { endTime: Number(e.target.value) })}
                          className="w-1/2 bg-background/60 border border-white/10 rounded p-0.5 text-center text-indigo-300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
