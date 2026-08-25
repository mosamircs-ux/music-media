"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
  EditorHeader,
  EditorLeftSidebar,
  EditorPreviewCanvas,
  EditorPropertiesInspector,
  EditorMultiTrackTimeline,
  ExportModal,
} from "@/components/editor";
import { useProjectStore } from "@/stores/projectStore";
import { MOCK_PROJECTS, MOCK_TRACKS } from "@/lib/mockData";
import type { Locale } from "@musicmotion/shared";

export default function ProjectEditorPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const {
    currentProject,
    initProject,
    selectTrack,
    setCaptions,
    setScenes,
    undo,
    redo,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    selectedElement,
    removeScene,
    removeCaption,
    setSelectedElement,
    isDirty,
    saveProject,
    saveStatus,
  } = useProjectStore();

  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  // Initialize project if not loaded or if id changed
  React.useEffect(() => {
    if (!currentProject || currentProject.id !== projectId) {
      const existing = MOCK_PROJECTS.find((p) => p.id === projectId);
      if (existing) {
        initProject((existing.locale || "en") as Locale, existing.title);
        if (existing.trackSelection?.track) {
          selectTrack(existing.trackSelection.track);
        } else {
          selectTrack(MOCK_TRACKS[0]);
        }
        if (existing.captions && existing.captions.length > 0) {
          setCaptions(existing.captions);
        }
        if (existing.scenes && existing.scenes.length > 0) {
          setScenes(existing.scenes);
        }
      } else {
        initProject("en", "AI Music Video Project");
        selectTrack(MOCK_TRACKS[0]);
      }
    }
  }, [projectId]);

  // Debounced Autosave (1500ms) with conflict protection
  React.useEffect(() => {
    if (!isDirty || saveStatus === "saving") return;

    const timer = setTimeout(() => {
      void saveProject();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDirty, saveStatus, saveProject]);

  // Global Keyboard Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      const isInputFocused = activeTag === "input" || activeTag === "textarea" || activeTag === "select";

      // Space = Play / Pause (only if not typing in text fields)
      if (e.code === "Space" && !isInputFocused) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
        return;
      }

      // Arrow Left / Right = Seek by 0.5s
      if (e.code === "ArrowLeft" && !isInputFocused) {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 0.5));
        return;
      }
      if (e.code === "ArrowRight" && !isInputFocused) {
        e.preventDefault();
        setCurrentTime((prev) => prev + 0.5);
        return;
      }

      // Ctrl+Z / Cmd+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Ctrl+Y / Cmd+Shift+Z / Cmd+Y = Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Delete / Backspace = Delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && !isInputFocused && selectedElement.id) {
        e.preventDefault();
        if (selectedElement.type === "scene") {
          removeScene(selectedElement.id);
        } else if (selectedElement.type === "caption") {
          removeCaption(selectedElement.id);
        }
        return;
      }

      // Escape = Deselect
      if (e.key === "Escape") {
        setSelectedElement({ type: null, id: null });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, undo, redo, selectedElement, removeScene, removeCaption, setSelectedElement, setIsPlaying, setCurrentTime]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden">
      {/* ── TOP: Action Bar Header ────────────────────────────── */}
      <EditorHeader onOpenExport={() => setIsExportModalOpen(true)} />

      {/* ── MIDDLE: 3-Column Studio Workstation ──────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left: Assets / Music / Storyboard / Captions */}
        <EditorLeftSidebar className="hidden md:flex" />

        {/* Center: 9:16 Preview Canvas + Playback HUD */}
        <EditorPreviewCanvas />

        {/* Right: Properties Inspector */}
        <EditorPropertiesInspector className="hidden lg:flex" />
      </div>

      {/* ── BOTTOM: Multi-Track Timeline ──────────────────────── */}
      <EditorMultiTrackTimeline />

      {/* ── EXPORT MODAL ──────────────────────────────────────── */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}