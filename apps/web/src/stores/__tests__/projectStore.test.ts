import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "../projectStore";
import type { Track } from "@musicmotion/shared";

const mockTrack: Track = {
  id: "test-track-1",
  provider: "jamendo",
  externalId: "12345",
  title: "Electric Dreams",
  artist: "Cyber Synth",
  artists: ["Cyber Synth"],
  duration: 120,
  audioUrl: "https://example.com/audio.mp3",
  isAvailableForVideo: true,
  license: {
    type: "Creative Commons BY 4.0",
    attributionRequired: true,
    commercialAllowed: true,
  },
  licenseInfo: {
    type: "Creative Commons BY 4.0",
    attributionRequired: true,
    commercialAllowed: true,
  },
};

describe("ProjectStore — Professional Editor State", () => {
  beforeEach(() => {
    useProjectStore.getState().initProject("en", "Test Project");
  });

  it("initializes project with default clean state", () => {
    const state = useProjectStore.getState();
    expect(state.currentProject).toBeDefined();
    expect(state.currentProject?.title).toBe("Test Project");
    expect(state.captions).toEqual([]);
    expect(state.scenes).toEqual([]);
    expect(state.saveStatus).toBe("saved");
    expect(state.isDirty).toBe(false);
  });

  it("selects track and configures video duration", () => {
    useProjectStore.getState().selectTrack(mockTrack);
    const state = useProjectStore.getState();

    expect(state.selectedTrack?.id).toBe("test-track-1");
    expect(state.trackSelection?.startTime).toBe(0);
    expect(state.trackSelection?.endTime).toBe(15);
    expect(state.videoConfig.duration).toBe(15);
    expect(state.isDirty).toBe(true);
    expect(state.saveStatus).toBe("unsaved");
  });

  it("adds, edits, and removes captions with history snapshots", () => {
    useProjectStore.getState().addCaption("Hello MusicMotion", 0, 3);
    let state = useProjectStore.getState();

    expect(state.captions.length).toBe(1);
    expect(state.captions[0].text).toBe("Hello MusicMotion");
    expect(state.canUndo()).toBe(true);

    const captionId = state.captions[0].id;
    useProjectStore.getState().updateCaption(captionId, { text: "Updated Lyric" });
    state = useProjectStore.getState();
    expect(state.captions[0].text).toBe("Updated Lyric");

    useProjectStore.getState().removeCaption(captionId);
    state = useProjectStore.getState();
    expect(state.captions.length).toBe(0);
  });

  it("adds, resizes, and reorders scenes", () => {
    useProjectStore.getState().addScene("Neon cityscape", 4);
    useProjectStore.getState().addScene("Sunset beach", 5);
    let state = useProjectStore.getState();

    expect(state.scenes.length).toBe(2);
    expect(state.scenes[0].prompt).toBe("Neon cityscape");
    expect(state.scenes[0].duration).toBe(4);

    const firstSceneId = state.scenes[0].id;
    useProjectStore.getState().resizeSceneDuration(firstSceneId, 6.5);
    state = useProjectStore.getState();
    expect(state.scenes[0].duration).toBe(6.5);

    useProjectStore.getState().reorderScenes(0, 1);
    state = useProjectStore.getState();
    expect(state.scenes[0].prompt).toBe("Sunset beach");
    expect(state.scenes[1].prompt).toBe("Neon cityscape");
  });

  it("supports undo and redo", () => {
    useProjectStore.getState().addScene("Scene 1", 3);
    useProjectStore.getState().addScene("Scene 2", 4);
    let state = useProjectStore.getState();
    expect(state.scenes.length).toBe(2);

    // Undo adding Scene 2
    useProjectStore.getState().undo();
    state = useProjectStore.getState();
    expect(state.scenes.length).toBe(1);
    expect(state.scenes[0].prompt).toBe("Scene 1");
    expect(state.canRedo()).toBe(true);

    // Redo adding Scene 2
    useProjectStore.getState().redo();
    state = useProjectStore.getState();
    expect(state.scenes.length).toBe(2);
    expect(state.scenes[1].prompt).toBe("Scene 2");
  });

  it("handles element selection", () => {
    useProjectStore.getState().addScene("Scene A", 3);
    const sceneId = useProjectStore.getState().scenes[0].id;

    useProjectStore.getState().setSelectedElement({ type: "scene", id: sceneId });
    expect(useProjectStore.getState().selectedElement).toEqual({ type: "scene", id: sceneId });

    useProjectStore.getState().setSelectedElement({ type: null, id: null });
    expect(useProjectStore.getState().selectedElement).toEqual({ type: null, id: null });
  });

  it("saves project and clears dirty state with version tracking", async () => {
    useProjectStore.getState().addCaption("Test Save", 0, 2);
    expect(useProjectStore.getState().isDirty).toBe(true);
    expect(useProjectStore.getState().saveStatus).toBe("unsaved");

    await useProjectStore.getState().saveProject();

    const state = useProjectStore.getState();
    expect(state.isDirty).toBe(false);
    expect(state.saveStatus).toBe("saved");
    expect(state.lastSavedVersion).toBe(state.currentVersion);
  });
});