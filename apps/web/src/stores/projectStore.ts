import { create } from "zustand";
import type {
  Project,
  Track,
  TrackSelection,
  Caption,
  Scene,
  VideoConfig,
  Locale,
} from "@musicmotion/shared";
import { generateId } from "@musicmotion/shared";

interface ProjectState {
  currentProject: Project | null;
  selectedTrack: Track | null;
  trackSelection: TrackSelection | null;
  captions: Caption[];
  scenes: Scene[];
  videoConfig: VideoConfig;
  isPlaying: boolean;
  currentTime: number;

  // Actions
  initProject: (locale: Locale, title?: string) => void;
  selectTrack: (track: Track) => void;
  updateSelection: (startTime: number, endTime: number) => void;
  addCaption: (text: string, startTime: number, endTime: number) => void;
  updateCaption: (id: string, updates: Partial<Caption>) => void;
  removeCaption: (id: string) => void;
  addScene: (prompt: string, duration?: number) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  removeScene: (id: string) => void;
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

  addCaption: (text: string, startTime: number, endTime: number) => {
    const { currentProject, captions } = get();
    const projectId = currentProject?.id || generateId();

    const newCaption: Caption = {
      id: generateId(),
      projectId,
      startTime,
      endTime,
      text,
      style: {
        position: "bottom",
        animation: "pop",
        fontSize: 44,
        textColor: "#ffffff",
      },
    };

    set({ captions: [...captions, newCaption] });
  },

  updateCaption: (id: string, updates: Partial<Caption>) => {
    set((state) => ({
      captions: state.captions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  removeCaption: (id: string) => {
    set((state) => ({
      captions: state.captions.filter((c) => c.id !== id),
    }));
  },

  addScene: (prompt: string, duration = 3) => {
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
      scenes: state.scenes.filter((s) => s.id !== id),
    }));
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
}));
