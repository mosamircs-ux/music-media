"use client";

import * as React from "react";
import {
  Undo2,
  Redo2,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Film,
} from "lucide-react";
import { Button, Badge, Input } from "@musicmotion/ui";
import { useProjectStore } from "@/stores/projectStore";

export interface EditorHeaderProps {
  onOpenExport: () => void;
  className?: string;
}

export function EditorHeader({ onOpenExport, className = "" }: EditorHeaderProps) {
  const {
    currentProject,
    setProjectTitle,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    saveProject,
    zoomLevel,
    setZoomLevel,
    isFullscreenPreview,
    setIsFullscreenPreview,
  } = useProjectStore();

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(
    currentProject?.title || "Untitled Music Video"
  );

  React.useEffect(() => {
    if (currentProject?.title) {
      setTitleInput(currentProject.title);
    }
  }, [currentProject?.title]);

  const handleTitleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (titleInput.trim()) {
      setProjectTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      className={`h-14 border-b border-border/40 bg-card/70 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-20 ${className}`}
    >
      {/* ── LEFT: Title & Edit ─────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
          <Film className="h-4 w-4 text-white" />
        </div>

        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5">
            <Input
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={() => handleTitleSubmit()}
              className="h-8 text-xs font-bold w-48 sm:w-64 bg-background/80"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded-lg transition-all text-left min-w-0"
            title="Click to rename project"
          >
            <span className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[140px] sm:max-w-[240px]">
              {currentProject?.title || "Untitled Music Video"}
            </span>
            <Badge variant="secondary" className="text-[9px] font-mono uppercase hidden md:inline-flex">
              9:16 Reel
            </Badge>
          </button>
        )}
      </div>

      {/* ── CENTER: Undo / Redo & Autosave Indicator ──────────── */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-secondary/30 border border-white/5 rounded-xl p-0.5">
          <button
            type="button"
            disabled={!canUndo()}
            onClick={undo}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all hover:bg-white/5"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={!canRedo()}
            onClick={redo}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all hover:bg-white/5"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Autosave Status Badge */}
        <div className="flex items-center gap-2 text-xs">
          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Saved
            </span>
          )}
          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 font-medium bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              <CircleDashed className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === "unsaved" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          )}
          {saveStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
              <AlertCircle className="h-3 w-3" />
              Save error
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void saveProject()}
            className="h-7 text-[11px] text-muted-foreground hover:text-foreground px-2"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* ── RIGHT: Zoom & Export CTA ──────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Timeline Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-secondary/30 border border-white/5 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="text-[10px] font-mono text-muted-foreground px-1 min-w-[36px] text-center font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Fullscreen Preview Toggle */}
        <button
          type="button"
          onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
          className={`p-2 rounded-xl border transition-all ${
            isFullscreenPreview
              ? "bg-purple-500 text-white border-purple-400"
              : "bg-secondary/40 border-white/10 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
          }`}
          title={isFullscreenPreview ? "Exit Fullscreen" : "Fullscreen Preview"}
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        {/* Export / Generate Video CTA */}
        <Button
          variant="gradient"
          size="sm"
          onClick={onOpenExport}
          className="h-9 px-4 rounded-xl font-bold text-xs shadow-md shadow-rose-500/25 gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Generate Video</span>
        </Button>
      </div>
    </header>
  );
}