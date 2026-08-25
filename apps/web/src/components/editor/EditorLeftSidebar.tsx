"use client";

import * as React from "react";
import {
  Music2,
  Sparkles,
  Captions as CaptionsIcon,
  Layers,
  Search,
  Plus,
  Trash2,
  Copy,
  Split,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Input, Badge } from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";
import { formatTime, type CaptionPresetStyle } from "@musicmotion/shared";
import { MOCK_TRACKS } from "@/lib/mockData";
import { ScenePlanner } from "../ScenePlanner";

export interface EditorLeftSidebarProps {
  className?: string;
}

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

export function EditorLeftSidebar({ className = "" }: EditorLeftSidebarProps) {
  const {
    currentProject,
    selectedTrack,
    trackSelection,
    captions,
    scenes,
    selectTrack,
    addCaption,
    removeCaption,
    duplicateCaption,
    splitCaption,
    setAllCaptionsStyle,
    selectedElement,
    setSelectedElement,
    watermarkText,
    setWatermarkText,
    showSafeZones,
    setShowSafeZones,
  } = useProjectStore();

  const [activeTab, setActiveTab] = React.useState<"music" | "scenes" | "captions" | "overlays">("scenes");
  const [searchTrackQuery, setSearchTrackQuery] = React.useState("");
  const [newCaptionText, setNewCaptionText] = React.useState("");

  const activeTrack = selectedTrack || MOCK_TRACKS[0];
  const startTime = trackSelection?.startTime || 0;
  const endTime = trackSelection?.endTime || 15;
  const duration = Math.max(1, endTime - startTime);

  const handleAddQuickCaption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaptionText.trim()) return;
    const start = captions.length > 0 ? captions[captions.length - 1].endTime : 0;
    addCaption(newCaptionText.trim(), start, Math.min(duration, start + 3));
    setNewCaptionText("");
  };

  return (
    <aside
      className={`w-80 sm:w-96 flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl flex-shrink-0 ${className}`}
    >
      {/* ── Top Tabs Navigation ──────────────────────────────── */}
      <div className="grid grid-cols-4 p-2 border-b border-border/40 gap-1 bg-background/40">
        <button
          type="button"
          onClick={() => setActiveTab("music")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all gap-1 ${
            activeTab === "music"
              ? "bg-rose-500 text-white shadow-sm shadow-rose-500/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Music2 className="h-3.5 w-3.5" />
          <span>Music</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all gap-1 ${
            activeTab === "scenes"
              ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Scenes ({scenes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("captions")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all gap-1 ${
            activeTab === "captions"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <CaptionsIcon className="h-3.5 w-3.5" />
          <span>Captions ({captions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overlays")}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold transition-all gap-1 ${
            activeTab === "overlays"
              ? "bg-amber-600 text-white shadow-sm shadow-amber-600/20"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Overlays</span>
        </button>
      </div>

      {/* ── Tab Panels Content ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── TAB 1: MUSIC & AUDIO ────────────────────────────── */}
        {activeTab === "music" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchTrackQuery}
                onChange={(e) => setSearchTrackQuery(e.target.value)}
                placeholder="Search licensed music..."
                className="pl-9 h-9 text-xs rounded-xl bg-background/60"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Available Tracks</span>
                <Badge variant="success" className="text-[9px]">Licensed</Badge>
              </div>

              {MOCK_TRACKS.filter(
                (t) =>
                  !searchTrackQuery ||
                  t.title.toLowerCase().includes(searchTrackQuery.toLowerCase()) ||
                  t.artist.toLowerCase().includes(searchTrackQuery.toLowerCase())
              ).map((track) => {
                const isSelected = track.id === activeTrack.id;
                const cover = track.albumArt || track.coverArtUrl;

                return (
                  <div
                    key={track.id}
                    onClick={() => selectTrack(track)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-rose-500 bg-rose-500/10 shadow-sm"
                        : "border-white/5 bg-secondary/30 hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {cover ? (
                        <img
                          src={cover}
                          alt={track.title}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                          <Music2 className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{track.title}</h4>
                        <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
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

        {/* ── TAB 2: AI SCENES & STORYBOARD ───────────────────── */}
        {activeTab === "scenes" && (
          <ScenePlanner
            track={activeTrack}
            projectId={currentProject?.id || "project-editor"}
            startTime={startTime}
            endTime={endTime}
            totalDuration={duration}
          />
        )}

        {/* ── TAB 3: TIMED CAPTIONS ───────────────────────────── */}
        {activeTab === "captions" && (
          <div className="space-y-4">
            {/* Quick Add Caption Form */}
            <form onSubmit={handleAddQuickCaption} className="flex gap-2">
              <Input
                value={newCaptionText}
                onChange={(e) => setNewCaptionText(e.target.value)}
                placeholder="Add timed lyrics / caption..."
                className="h-9 text-xs rounded-xl bg-background/60"
              />
              <Button
                type="submit"
                variant="gradient"
                size="sm"
                disabled={!newCaptionText.trim()}
                className="h-9 px-3 rounded-xl flex-shrink-0 font-bold text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </form>

            {/* Global Style Preset Pills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground block">
                Preset Typography Style:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CAPTION_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setAllCaptionsStyle(style)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-secondary/40 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all"
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Captions List */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Captions Timeline Track</span>
                <span className="text-[10px] font-mono">{captions.length} segments</span>
              </div>

              {captions.length === 0 ? (
                <div className="p-6 rounded-2xl bg-secondary/20 border border-dashed border-white/10 text-center space-y-1">
                  <CaptionsIcon className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">No captions added yet.</p>
                </div>
              ) : (
                captions.map((cap) => {
                  const isSelected = selectedElement.type === "caption" && selectedElement.id === cap.id;

                  return (
                    <div
                      key={cap.id}
                      onClick={() => setSelectedElement({ type: "caption", id: cap.id })}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                          : "border-white/5 bg-secondary/30 hover:bg-secondary/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                          {formatTime(cap.startTime)} → {formatTime(cap.endTime)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateCaption(cap.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-white/5"
                            title="Duplicate"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              splitCaption(cap.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-white/5"
                            title="Split at midpoint"
                          >
                            <Split className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCaption(cap.id);
                            }}
                            className="p-1 text-muted-foreground hover:text-rose-400 rounded hover:bg-white/5"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-foreground line-clamp-2" dir={cap.isRTL ? "rtl" : "ltr"}>
                        {cap.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: OVERLAYS & BRANDING ──────────────────────── */}
        {activeTab === "overlays" && (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-foreground block">Watermark / Branding Text</label>
              <Input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Brand name (e.g. MusicMotion)"
                className="h-9 text-xs bg-background/60"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">9:16 Safe Zones</span>
                  <span className="text-[11px] text-muted-foreground">Display TikTok / Reels UI overlays</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSafeZones(!showSafeZones)}
                  className={`p-2 rounded-xl border transition-all ${
                    showSafeZones
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-secondary/40 border-white/10 text-muted-foreground"
                  }`}
                >
                  {showSafeZones ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}