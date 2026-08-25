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

  // Actions
  initProject: (locale: Locale, title?: string) => void;
  selectTrack: (track: Track) => void;
  updateSelection: (startTime: number, endTime: number) => void;
  setCaptions: (captions: Caption[]) => void;
  addCaption: (text: string, startTime: number, endTime: number, options?: Partial<Caption>) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  removeCaption: (id: string) => void;
  duplicateCaption: (id: string) => void;
  splitCaption: (id: string, splitTime?: number) => void;
  mergeCaptions: (id1: string, id2: string) => void;
  setAllCaptionsStyle: (style: CaptionPresetStyle) => void;
  setScenes: (scenes: Scene[]) => void;
  addScene: (prompt: string, duration?: number, options?: Partial<Scene>) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
  applyScenePlan: (plan: ScenePlan) => void;
  setGenerationJob: (sceneId: string, job: GenerationJobStatus) => void;
  clearGenerationJob: (sceneId: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number | ((prev: number) => number)) => void;
  setVideoConfig: (config: Partial<VideoConfig>) => void;
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

    set({
      currentProject: newProject,
      selectedTrack: null,
      trackSelection: null,
      captions: [],
      scenes: [],
      currentTime: 0,
      isPlaying: false,
    });
  },

  selectTrack: (track: Track) => {
    const { currentProject } = get();
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

    set({
      selectedTrack: track,
      trackSelection: selection,
      videoConfig: {
        ...get().videoConfig,
        duration,
      },
    });
  },

  updateSelection: (startTime: number, endTime: number) => {
    const { trackSelection, videoConfig } = get();
    if (!trackSelection) return;

    const duration = Math.max(1, endTime - startTime);
    set({
      trackSelection: {
        ...trackSelection,
        startTime,
        endTime,
      },
      videoConfig: {
        ...videoConfig,
        duration,
      },
    });
  },

  setCaptions: (captions: Caption[]) => set({ captions }),

  addCaption: (text: string, startTime: number, endTime: number, options?: Partial<Caption>) => {
    const { currentProject, captions } = get();
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

    set({ captions: [...captions, newCaption].sort((a, b) => a.startTime - b.startTime) });
  },

  updateCaption: (id: string, updates: Partial<Caption>) => {
    set((state) => ({
      captions: state.captions.map((c) => {
        if (c.id !== id) return c;
        const newText = updates.text !== undefined ? updates.text : c.text;
        return {
          ...c,
          ...updates,
          isRTL: updates.isRTL !== undefined ? updates.isRTL : isRTLText(newText),
        };
      }),
    }));
  },

  removeCaption: (id: string) => {
    set((state) => ({
      captions: state.captions.filter((c) => c.id !== id),
    }));
  },

  duplicateCaption: (id: string) => {
    const { captions } = get();
    const target = captions.find((c) => c.id === id);
    if (!target) return;

    const dup = utilDuplicateCaption(target);
    set({ captions: [...captions, dup].sort((a, b) => a.startTime - b.startTime) });
  },

  splitCaption: (id: string, splitTime?: number) => {
    const { captions } = get();
    const target = captions.find((c) => c.id === id);
    if (!target) return;

    const [c1, c2] = utilSplitCaption(target, splitTime);
    set({
      captions: captions
        .flatMap((c) => (c.id === id ? [c1, c2] : [c]))
        .sort((a, b) => a.startTime - b.startTime),
    });
  },

  mergeCaptions: (id1: string, id2: string) => {
    const { captions } = get();
    const cap1 = captions.find((c) => c.id === id1);
    const cap2 = captions.find((c) => c.id === id2);
    if (!cap1 || !cap2) return;

    const merged = utilMergeCaptions(cap1, cap2);
    set({
      captions: captions
        .filter((c) => c.id !== id1 && c.id !== id2)
        .concat([merged])
        .sort((a, b) => a.startTime - b.startTime),
    });
  },

  setAllCaptionsStyle: (style: CaptionPresetStyle) => {
    set((state) => ({
      captions: state.captions.map((c) => ({ ...c, style })),
    }));
  },


  setScenes: (scenes: Scene[]) => set({ scenes }),

  addScene: (prompt: string, duration = 3, options?: Partial<Scene>) => {
    const { currentProject, scenes } = get();
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

    set({ scenes: [...scenes, newScene] });
  },

  updateScene: (id: string, updates: Partial<Scene>) => {
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  removeScene: (id: string) => {
    set((state) => ({
      scenes: state.scenes
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, order: idx })),
    }));
  },

  reorderScenes: (fromIndex: number, toIndex: number) => {
    const { scenes } = get();
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

    set({
      scenes: reordered.map((s, idx) => ({ ...s, order: idx })),
    });
  },

  applyScenePlan: (plan: ScenePlan) => {
    const { currentProject } = get();
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

    set({ scenes: convertedScenes });
  },


  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  setCurrentTime: (currentTime: number | ((prev: number) => number)) =>
    set((state) => ({
      currentTime: typeof currentTime === "function" ? currentTime(state.currentTime) : currentTime,
    })),
  setVideoConfig: (config: Partial<VideoConfig>) =>
    set((state) => ({
      videoConfig: { ...state.videoConfig, ...config },
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
