import { describe, it, expect } from "vitest";
import { GenericAIProvider } from "./providers/generic";
import { OpenAIProvider } from "./providers/openai";
import { sanitizeScenePlan, ScenePlanInputSchema } from "./schemas";
import { aiScenePlanner } from "./registry";
import type { NormalizedTrack } from "@musicmotion/shared";

const MOCK_TRACK: NormalizedTrack = {
  id: "track-neon-1",
  externalId: "neon-1",
  title: "Hyperdrive Dream",
  artist: "Neon Skyline",
  artists: ["Neon Skyline"],
  album: "Cyberpunk Odyssey",
  duration: 180,
  genre: "Synthwave / Cyberpunk",
  mood: "Energetic Futuristic",
  tempo: "Fast",
  bpm: 135,
  provider: "jamendo",
  isAvailableForVideo: true,

  audioUrl: "https://example.com/audio.mp3",
  previewUrl: "https://example.com/audio.mp3",
  licenseInfo: {
    type: "creative-commons",
    commercialAllowed: true,
    attributionRequired: true,
  },
  license: {
    type: "creative-commons",
    commercialAllowed: true,
    attributionRequired: true,
  },
};



describe("AI Scene Planning Engine", () => {
  describe("GenericAIProvider (Algorithmic Storyboard Engine)", () => {
    const provider = new GenericAIProvider();

    it("generates a continuous multi-scene plan matching exact duration", async () => {
      const plan = await provider.generateScenePlan({
        track: MOCK_TRACK,
        startTime: 10,
        endTime: 25,
        duration: 15,
        visualStyle: "Cinematic",
        userDescription: "A retro-futuristic hero escaping through neon rain",
      });

      expect(plan.title).toContain("Hyperdrive Dream");
      expect(plan.visualStyle).toBe("Cinematic");
      expect(plan.totalDuration).toBe(15);
      expect(plan.scenes.length).toBeGreaterThanOrEqual(2);

      // Verify strict sequential continuity: 0 -> scene1_end -> scene2_end -> totalDuration
      expect(plan.scenes[0].startTime).toBe(0);
      expect(plan.scenes[plan.scenes.length - 1].endTime).toBe(15);

      for (let i = 0; i < plan.scenes.length - 1; i++) {
        expect(plan.scenes[i].endTime).toBe(plan.scenes[i + 1].startTime);
      }
    });

    it("preserves visual continuity and consistent color palettes across scenes", async () => {
      const plan = await provider.generateScenePlan({
        track: MOCK_TRACK,
        startTime: 0,
        endTime: 20,
        duration: 20,
        visualStyle: "Anime",
        userDescription: "Sky city adventure",
      });

      expect(plan.colorPalette.length).toBeGreaterThan(1);
      expect(plan.continuityGuidelines).toBeDefined();

      plan.scenes.forEach((scene, idx) => {
        expect(scene.prompt).toBeDefined();
        expect(scene.prompt.length).toBeGreaterThan(20);
        expect(scene.camera).toBeDefined();
        expect(scene.order).toBe(idx);
        expect(scene.transition).toBeDefined();
      });
    });

    it("analyzes music BPM and suggests appropriate video pacing", async () => {
      const analysis = await provider.analyzeMusic(MOCK_TRACK);

      expect(analysis.energy).toBe("high");
      expect(analysis.suggestedPacing).toBe("fast-cuts");
      expect(analysis.recommendedSceneCount).toBe(4);
    });

    it("generates contextual single visual prompts", async () => {
      const prompt = await provider.generateVisualPrompt({
        track: MOCK_TRACK,
        visualStyle: "Cyberpunk",
        sceneIndex: 0,
        totalScenes: 3,
        camera: "FPV Drone Orbit",
        captionText: "Lost in the night lights",
      });

      expect(prompt).toContain("Cyberpunk");
      expect(prompt).toContain("FPV Drone Orbit");
      expect(prompt).toContain("Lost in the night lights");
    });
  });

  describe("Structured JSON Validation & Sanitization", () => {
    it("safely sanitizes malformed scene timings without crashing", () => {
      const malformedRaw = {
        title: "Test Video",
        visualConcept: "Test Concept",
        visualStyle: "Cinematic",
        mood: "Dramatic",
        colorPalette: ["#000000", "#ffffff"],
        continuityGuidelines: "Rule 1",
        totalDuration: 15,
        scenes: [
          {
            order: 0,
            startTime: -5, // Invalid negative
            endTime: 8,
            prompt: "Scene 1",
          },
          {
            order: 1,
            startTime: 8,
            endTime: 30, // Over duration
            prompt: "Scene 2",
          },
        ],
      };

      const sanitized = sanitizeScenePlan(malformedRaw, 15);

      expect(sanitized.totalDuration).toBe(15);
      expect(sanitized.scenes[0].startTime).toBe(0);
      expect(sanitized.scenes[1].endTime).toBe(15);
      expect(sanitized.scenes[0].endTime).toBe(sanitized.scenes[1].startTime);
    });

    it("rescues completely invalid input into a safe baseline plan", () => {
      const completelyBroken = { garbage: 12345 };
      const sanitized = sanitizeScenePlan(completelyBroken, 12);

      expect(sanitized.totalDuration).toBe(12);
      expect(sanitized.scenes.length).toBe(1);
      expect(sanitized.scenes[0].startTime).toBe(0);
      expect(sanitized.scenes[0].endTime).toBe(12);
      expect(sanitized.scenes[0].prompt).toBeDefined();
    });

    it("validates valid ScenePlanInputSchema", () => {
      const input = {
        track: MOCK_TRACK,
        startTime: 0,
        endTime: 15,
        visualStyle: "Cinematic",
        userDescription: "Futuristic city run",
      };

      const parsed = ScenePlanInputSchema.safeParse(input);
      expect(parsed.success).toBe(true);
    });
  });

  describe("OpenAIProvider & Registry Fallback Handling", () => {
    it("falls back cleanly to GenericAIProvider when API key is missing", async () => {
      const provider = new OpenAIProvider({ apiKey: "" });
      const plan = await provider.generateScenePlan({
        track: MOCK_TRACK,
        startTime: 0,
        endTime: 15,
      });

      expect(plan.scenes.length).toBeGreaterThanOrEqual(1);
      expect(plan.totalDuration).toBe(15);
    });

    it("orchestrates generation through aiScenePlanner singleton", async () => {
      const plan = await aiScenePlanner.generateScenePlanWithFallback({
        track: MOCK_TRACK,
        startTime: 5,
        endTime: 20,
        duration: 15,
        visualStyle: "Anime",
      });

      expect(plan.totalDuration).toBe(15);
      expect(plan.scenes.length).toBeGreaterThanOrEqual(2);
    });
  });
});
