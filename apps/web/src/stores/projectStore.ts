import { create } from "zustand";
import type {
  Project,
  Track,
  TrackSelection,
  Caption,
  CaptionPresetStyle,
  Scene,
  ScenePlan,
  VisualStyle,
  TransitionType,
  VideoConfig,
  Locale,
  GenerationJobStatus,
} from "@musicmotion/shared";
import {
  generateId,
  isRTLText,
  splitCaption as utilSplitCaption,
  mergeCaptions as utilMergeCaptions,
  duplicateCaption as utilDuplicateCaption,
} from "@musicmotion/shared";

export type SelectedElementType = "scene" | "caption" | "track" | "overlay" | null;

export interface SelectedElement {
  type: SelectedElementType;
  id: string | null;
}

export interface ProjectSnapshot {
  captions: Caption[];
  scenes: Scene[];
  trackSelection: TrackSelection | null;
  videoConfig: VideoConfig;
}

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

interface ProjectState {
  currentProject: Project | null;
  selectedTrack: Track | null;
  trackSelection: TrackSelection | null;
  captions: Caption[];
  scenes: Scene[];
  /** Generation job status keyed by sceneId */
  generationJobs: Record<string, GenerationJobStatus>;
  videoConfig: VideoConfig;
  isPlaying: boolean;
  currentTime: number;

  // Selection & Inspector
  selectedElement: SelectedElement;
  setSelectedElement: (element: SelectedElement) => void;

  // History & Undo / Redo
  history: ProjectSnapshot[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Autosave & Conflict Protection
  isDirty: boolean;
  saveStatus: SaveStatus;
  currentVersion: number;
  lastSavedVersion: number;
  lastSavedAt: string | null;
  saveProject: () => Promise<void>;
  setSaveStatus: (status: SaveStatus) => void;

  // Viewport & Timeline Controls
  zoomLevel: number;
  setZoomLevel: (zoom: number | ((prev: number) => number)) => void;
  isFullscreenPreview: boolean;
  setIsFullscreenPreview: (fullscreen: boolean) => void;
  showSafeZones: boolean;
  setShowSafeZones: (show: boolean) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;

  // Actions
  setProjectTitle: (title: string) => void;
  initProject: (locale: Locale, title?: string) => void;
  selectTrack: (track: Track) => void;
  updateSelection: (startTime: number, endTime: number) => void;
  setCaptions: (captions: Caption[]) => void;
  addCaption: (text: string, startTime: number, endTime: number, options?: Partial<Caption>) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  updateCaptionTiming: (id: string, startTime: number, endTime: number) => void;
  removeCaption: (id: string) => void;
  duplicateCaption: (id: string) => void;
  splitCaption: (id: string, splitTime?: number) => void;
  mergeCaptions: (id1: string, id2: string) => void;
  setAllCaptionsStyle: (style: CaptionPresetStyle) => void;
  setScenes: (scenes: Scene[]) => void;
  addScene: (prompt: string, duration?: number, options?: Partial<Scene>) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  resizeSceneDuration: (id: string, newDuration: number) => void;
  removeScene: (id: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  applyScenePlan: (plan: ScenePlan) => void;
  setGenerationJob: (sceneId: string, job: GenerationJobStatus) => void;
  clearGenerationJob: (sceneId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number | ((prev: number) => number)) => void;
  setVideoConfig: (config: Partial<VideoConfig>) => void;
}

const MAX_HISTORY = 30;

function takeSnapshot(state: {
  captions: Caption[];
  scenes: Scene[];
  trackSelection: TrackSelection | null;
  videoConfig: VideoConfig;
}): ProjectSnapshot {
  return {
    captions: JSON.parse(JSON.stringify(state.captions)),
    scenes: JSON.parse(JSON.stringify(state.scenes)),
    trackSelection: state.trackSelection ? JSON.parse(JSON.stringify(state.trackSelection)) : null,
    videoConfig: { ...state.videoConfig },
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  selectedTrack: null,
  trackSelection: null,
  captions: [],
  scenes: [],
  generationJobs: {},
  videoConfig: {
    width: 1080,
    height: 1920,
    fps: 30,
    aspectRatio: "9:16",
    duration: 15,
  },
  isPlaying: false,
  currentTime: 0,

  // Selection
  selectedElement: { type: null, id: null },
  setSelectedElement: (element) => set({ selectedElement: element }),

  // History Stack
  history: [],
  historyIndex: -1,

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetSnapshot = history[targetIndex];
      set({
        captions: targetSnapshot.captions,
        scenes: targetSnapshot.scenes,
        trackSelection: targetSnapshot.trackSelection,
        videoConfig: targetSnapshot.videoConfig,
        historyIndex: targetIndex,
        isDirty: true,
        saveStatus: "unsaved",
        currentVersion: get().currentVersion + 1,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetSnapshot = history[targetIndex];
      set({
        captions: targetSnapshot.captions,
        scenes: targetSnapshot.scenes,
        trackSelection: targetSnapshot.trackSelection,
        videoConfig: targetSnapshot.videoConfig,
        historyIndex: targetIndex,
        isDirty: true,
        saveStatus: "unsaved",
        currentVersion: get().currentVersion + 1,
      });
    }
  },

  // Autosave & Versioning
  isDirty: false,
  saveStatus: "saved",
  currentVersion: 1,
  lastSavedVersion: 1,
  lastSavedAt: new Date().toISOString(),

  setSaveStatus: (status) => set({ saveStatus: status }),

  saveProject: async () => {
    const { currentProject, captions, scenes, trackSelection, videoConfig, currentVersion } = get();
    set({ saveStatus: "saving" });

    try {
      // Simulate / call API save
      await new Promise((r) => setTimeout(r, 600));

      // Conflict protection check: ensure no newer version was started while saving
      if (get().currentVersion === currentVersion) {
        set({
          isDirty: false,
          saveStatus: "saved",
          lastSavedVersion: currentVersion,
          lastSavedAt: new Date().toISOString(),
          currentProject: currentProject
            ? {
                ...currentProject,
                captions,
                scenes,
                trackSelection: trackSelection || undefined,
                videoConfig,
                updatedAt: new Date().toISOString(),
              }
            : null,
        });
      }
    } catch {
      set({ saveStatus: "error" });
    }
  },

  // Viewport & Timeline Controls
  zoomLevel: 1.0,
  setZoomLevel: (zoom) =>
    set((state) => ({
      zoomLevel: typeof zoom === "function" ? zoom(state.zoomLevel) : zoom,
    })),
  isFullscreenPreview: false,
  setIsFullscreenPreview: (isFullscreenPreview) => set({ isFullscreenPreview }),
  showSafeZones: true,
  setShowSafeZones: (showSafeZones) => set({ showSafeZones }),
  watermarkText: "MusicMotion",
  setWatermarkText: (watermarkText) => set({ watermarkText }),

  // Helpers to push history
  setProjectTitle: (title: string) => {
    const { currentProject } = get();
    if (!currentProject) return;
    set({
      currentProject: { ...currentProject, title },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  initProject: (locale: Locale, title = "Untitled MusicMotion") => {
    const projectId = generateId();
    const newProject: Project = {
      id: projectId,
      title,
      status: "draft",
      locale,
      captions: [],
      scenes: [],
      videoConfig: {
        width: 1080,
        height: 1920,
        fps: 30,
        aspectRatio: "9:16",
        duration: 15,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const initialSnapshot: ProjectSnapshot = {
      captions: [],
      scenes: [],
      trackSelection: null,
      videoConfig: newProject.videoConfig,
    };

    set({
      currentProject: newProject,
      selectedTrack: null,
      trackSelection: null,
      captions: [],
      scenes: [],
      currentTime: 0,
      isPlaying: false,
      selectedElement: { type: null, id: null },
      history: [initialSnapshot],
      historyIndex: 0,
      isDirty: false,
      saveStatus: "saved",
      currentVersion: 1,
      lastSavedVersion: 1,
    });
  },

  selectTrack: (track: Track) => {
    const { currentProject, history, historyIndex } = get();
    const projectId = currentProject?.id || generateId();
    const duration = Math.min(15, track.duration);

    const selection: TrackSelection = {
      id: generateId(),
      projectId,
      trackId: track.id,
      track,
      startTime: 0,
      endTime: duration,
    };

    const nextConfig = { ...get().videoConfig, duration };
    const nextState = {
      selectedTrack: track,
      trackSelection: selection,
      videoConfig: nextConfig,
      selectedElement: { type: "track" as const, id: selection.id },
      isDirty: true,
      saveStatus: "unsaved" as const,
      currentVersion: get().currentVersion + 1,
    };

    const snapshot = takeSnapshot({
      captions: get().captions,
      scenes: get().scenes,
      trackSelection: selection,
      videoConfig: nextConfig,
    });

    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      ...nextState,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateSelection: (startTime: number, endTime: number) => {
    const { trackSelection, videoConfig, history, historyIndex } = get();
    if (!trackSelection) return;

    const duration = Math.max(1, endTime - startTime);
    const updatedSelection = { ...trackSelection, startTime, endTime };
    const updatedConfig = { ...videoConfig, duration };

    const snapshot = takeSnapshot({
      captions: get().captions,
      scenes: get().scenes,
      trackSelection: updatedSelection,
      videoConfig: updatedConfig,
    });

    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      trackSelection: updatedSelection,
      videoConfig: updatedConfig,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setCaptions: (captions: Caption[]) => {
    const snapshot = takeSnapshot({
      ...get(),
      captions,
    });
    const newHistory = get().history.slice(0, get().historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);
    set({
      captions,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addCaption: (text: string, startTime: number, endTime: number, options?: Partial<Caption>) => {
    const { currentProject, captions, history, historyIndex } = get();
    const projectId = currentProject?.id || generateId();
    const isRTL = isRTLText(text);

    const newCaption: Caption = {
      id: generateId(),
      projectId,
      startTime,
      endTime,
      text,
      style: options?.style || "Modern",
      animation: options?.animation || "Pop",
      position: options?.position || "bottom",
      fontSize: options?.fontSize || 42,
      fontWeight: options?.fontWeight || "bold",
      color: options?.color || "#ffffff",
      background: options?.background || "rgba(0,0,0,0.65)",
      alignment: options?.alignment || (isRTL ? "right" : "center"),
      isRTL,
      ...options,
    };

    const nextCaptions = [...captions, newCaption].sort((a, b) => a.startTime - b.startTime);
    const snapshot = takeSnapshot({ ...get(), captions: nextCaptions });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      captions: nextCaptions,
      selectedElement: { type: "caption", id: newCaption.id },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateCaption: (id: string, updates: Partial<Caption>) => {
    const nextCaptions = get().captions.map((c) => {
      if (c.id !== id) return c;
      const newText = updates.text !== undefined ? updates.text : c.text;
      return {
        ...c,
        ...updates,
        isRTL: updates.isRTL !== undefined ? updates.isRTL : isRTLText(newText),
      };
    });

    set({
      captions: nextCaptions,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  updateCaptionTiming: (id: string, startTime: number, endTime: number) => {
    const nextCaptions = get().captions
      .map((c) => (c.id === id ? { ...c, startTime: Math.max(0, startTime), endTime: Math.max(startTime + 0.1, endTime) } : c))
      .sort((a, b) => a.startTime - b.startTime);

    set({
      captions: nextCaptions,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  removeCaption: (id: string) => {
    const nextCaptions = get().captions.filter((c) => c.id !== id);
    const snapshot = takeSnapshot({ ...get(), captions: nextCaptions });
    const newHistory = get().history.slice(0, get().historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      captions: nextCaptions,
      selectedElement: get().selectedElement.id === id ? { type: null, id: null } : get().selectedElement,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  duplicateCaption: (id: string) => {
    const { captions, history, historyIndex } = get();
    const target = captions.find((c) => c.id === id);
    if (!target) return;

    const dup = utilDuplicateCaption(target);
    const nextCaptions = [...captions, dup].sort((a, b) => a.startTime - b.startTime);
    const snapshot = takeSnapshot({ ...get(), captions: nextCaptions });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      captions: nextCaptions,
      selectedElement: { type: "caption", id: dup.id },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  splitCaption: (id: string, splitTime?: number) => {
    const { captions, history, historyIndex } = get();
    const target = captions.find((c) => c.id === id);
    if (!target) return;

    const [c1, c2] = utilSplitCaption(target, splitTime);
    const nextCaptions = captions
      .flatMap((c) => (c.id === id ? [c1, c2] : [c]))
      .sort((a, b) => a.startTime - b.startTime);

    const snapshot = takeSnapshot({ ...get(), captions: nextCaptions });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      captions: nextCaptions,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  mergeCaptions: (id1: string, id2: string) => {
    const { captions, history, historyIndex } = get();
    const cap1 = captions.find((c) => c.id === id1);
    const cap2 = captions.find((c) => c.id === id2);
    if (!cap1 || !cap2) return;

    const merged = utilMergeCaptions(cap1, cap2);
    const nextCaptions = captions
      .filter((c) => c.id !== id1 && c.id !== id2)
      .concat([merged])
      .sort((a, b) => a.startTime - b.startTime);

    const snapshot = takeSnapshot({ ...get(), captions: nextCaptions });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      captions: nextCaptions,
      selectedElement: { type: "caption", id: merged.id },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setAllCaptionsStyle: (style: CaptionPresetStyle) => {
    const nextCaptions = get().captions.map((c) => ({ ...c, style }));
    set({
      captions: nextCaptions,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  setScenes: (scenes: Scene[]) => {
    const snapshot = takeSnapshot({ ...get(), scenes });
    const newHistory = get().history.slice(0, get().historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);
    set({
      scenes,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  addScene: (prompt: string, duration = 3, options?: Partial<Scene>) => {
    const { currentProject, scenes, history, historyIndex } = get();
    const projectId = currentProject?.id || generateId();

    const newScene: Scene = {
      id: generateId(),
      projectId,
      prompt,
      order: scenes.length,
      duration,
      transition: {
        type: "fade",
        duration: 0.5,
      },
      status: "idle",
      ...options,
    };

    const nextScenes = [...scenes, newScene];
    const snapshot = takeSnapshot({ ...get(), scenes: nextScenes });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      scenes: nextScenes,
      selectedElement: { type: "scene", id: newScene.id },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  updateScene: (id: string, updates: Partial<Scene>) => {
    const nextScenes = get().scenes.map((s) => (s.id === id ? { ...s, ...updates } : s));
    set({
      scenes: nextScenes,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  resizeSceneDuration: (id: string, newDuration: number) => {
    const duration = Math.max(0.5, Math.min(30, newDuration));
    const nextScenes = get().scenes.map((s) => (s.id === id ? { ...s, duration } : s));
    set({
      scenes: nextScenes,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
    });
  },

  removeScene: (id: string) => {
    const nextScenes = get().scenes
      .filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, order: idx }));

    const snapshot = takeSnapshot({ ...get(), scenes: nextScenes });
    const newHistory = get().history.slice(0, get().historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      scenes: nextScenes,
      selectedElement: get().selectedElement.id === id ? { type: null, id: null } : get().selectedElement,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  reorderScenes: (fromIndex: number, toIndex: number) => {
    const { scenes, history, historyIndex } = get();
    if (
      fromIndex < 0 ||
      fromIndex >= scenes.length ||
      toIndex < 0 ||
      toIndex >= scenes.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const reordered = [...scenes];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const nextScenes = reordered.map((s, idx) => ({ ...s, order: idx }));

    const snapshot = takeSnapshot({ ...get(), scenes: nextScenes });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      scenes: nextScenes,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  applyScenePlan: (plan: ScenePlan) => {
    const { currentProject, history, historyIndex } = get();
    const projectId = currentProject?.id || generateId();

    const convertedScenes: Scene[] = plan.scenes.map((sc, idx) => ({
      id: sc.id || generateId(),
      projectId,
      prompt: sc.prompt,
      order: idx,
      duration: sc.duration,
      startTime: sc.startTime,
      endTime: sc.endTime,
      mood: sc.mood,
      camera: sc.camera,
      visualStyle: (plan.visualStyle as VisualStyle) || "Cinematic",
      transition: {
        type: (sc.transition as TransitionType) || "fade",
        duration: sc.transitionDuration || 0.5,
      },
      status: "idle",
    }));

    const snapshot = takeSnapshot({ ...get(), scenes: convertedScenes });
    const newHistory = history.slice(0, historyIndex + 1).concat([snapshot]).slice(-MAX_HISTORY);

    set({
      scenes: convertedScenes,
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: get().currentVersion + 1,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setCurrentTime: (currentTime: number | ((prev: number) => number)) =>
    set((state) => ({
      currentTime: typeof currentTime === "function" ? currentTime(state.currentTime) : currentTime,
    })),
  setVideoConfig: (config: Partial<VideoConfig>) =>
    set((state) => ({
      videoConfig: { ...state.videoConfig, ...config },
      isDirty: true,
      saveStatus: "unsaved",
      currentVersion: state.currentVersion + 1,
    })),

  setGenerationJob: (sceneId: string, job: GenerationJobStatus) =>
    set((state) => ({
      generationJobs: { ...state.generationJobs, [sceneId]: job },
    })),

  clearGenerationJob: (sceneId: string) =>
    set((state) => {
      const { [sceneId]: _removed, ...rest } = state.generationJobs;
      return { generationJobs: rest };
    }),
}));