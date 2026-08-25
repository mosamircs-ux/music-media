import { z } from "zod";
import { generateId } from "@musicmotion/shared";
import type { ScenePlan, PlannedScene } from "@musicmotion/shared";

/**
 * Zod Schema for Individual Planned Scene
 */
export const PlannedSceneSchema = z.object({
  id: z.string().default(() => generateId()),
  order: z.number().int().nonnegative().default(0),
  startTime: z.number().nonnegative(),
  endTime: z.number().positive(),
  duration: z.number().positive().optional(),
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  negativePrompt: z.string().optional(),
  mood: z.string().default("Cinematic"),
  camera: z.string().default("Slow Dolly In"),
  transition: z.string().default("fade"),
  transitionDuration: z.number().nonnegative().default(0.5),
  captionSuggestions: z.array(z.string()).optional().default([]),
  visualContinuityNotes: z.string().optional(),
  imageUrl: z.string().optional(),
});

/**
 * Zod Schema for Full Scene Plan
 */
export const ScenePlanSchema = z.object({
  title: z.string().min(1).default("Visual Storyboard"),
  visualConcept: z.string().min(1).default("Cinematic music visual story"),
  visualStyle: z.string().default("Cinematic"),
  mood: z.string().default("Atmospheric"),
  colorPalette: z.array(z.string()).min(1).default(["#0f172a", "#38bdf8", "#818cf8"]),
  continuityGuidelines: z.string().default("Maintain consistent character and lighting across scenes"),
  totalDuration: z.number().positive(),
  scenes: z.array(PlannedSceneSchema).min(1, "At least one scene is required"),
  createdAt: z.string().optional().default(() => new Date().toISOString()),
});

/**
 * Zod Schema for Scene Planning Request Input
 */
export const ScenePlanInputSchema = z.object({
  track: z
    .object({
      id: z.string(),
      title: z.string(),
      artist: z.string(),
      artists: z.array(z.string()).optional(),
      provider: z.string().optional(),
      externalId: z.string().optional(),
      genre: z.string().optional().default("Pop"),
      mood: z.string().optional().default("Energetic"),
      tempo: z.string().optional().default("Medium"),
      bpm: z.number().optional().default(120),
      duration: z.number().optional().default(180),
      lyrics: z.string().optional(),
      audioUrl: z.string().optional(),
      previewUrl: z.string().optional(),
      isAvailableForVideo: z.boolean().optional(),
    })
    .passthrough(),
  startTime: z.number().nonnegative().default(0),
  endTime: z.number().positive().default(15),
  duration: z.number().positive().optional(),

  captions: z
    .array(
      z.object({
        id: z.string().optional(),
        text: z.string(),
        startTime: z.number(),
        endTime: z.number(),
      })
    )
    .optional()
    .default([]),
  visualStyle: z.string().optional().default("Cinematic"),
  userDescription: z.string().optional().default(""),
  referenceImage: z.string().optional(),
  targetSceneCount: z.number().int().min(1).max(12).optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).optional().default("9:16"),
});

export type ScenePlanInputData = z.infer<typeof ScenePlanInputSchema>;

function createBaselinePlan(duration: number): ScenePlan {
  return {
    title: "Cinematic Visual Journey",
    visualConcept: "Music visualization narrative",
    visualStyle: "Cinematic",
    mood: "Dynamic",
    colorPalette: ["#0f172a", "#ec4899", "#8b5cf6"],
    continuityGuidelines: "Single seamless cinematic visual sequence",
    totalDuration: duration,
    scenes: [
      {
        id: generateId(),
        order: 0,
        startTime: 0,
        endTime: duration,
        duration: duration,
        prompt:
          "Cinematic visual atmosphere synchronized with audio beats, 8k resolution, volumetric lighting, vertical 9:16 composition",
        mood: "Cinematic",
        camera: "Slow Dolly In",
        transition: "fade",
        transitionDuration: 0.5,
        captionSuggestions: [],
        visualContinuityNotes: "Primary master scene",
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Sanitizes and guarantees strict temporal continuity and duration alignment.
 * Never trust raw AI JSON.
 */
export function sanitizeScenePlan(raw: unknown, expectedTotalDuration: number): ScenePlan {
  const duration = Math.max(1, Math.round(expectedTotalDuration * 100) / 100);

  if (typeof raw !== "object" || raw === null) {
    return createBaselinePlan(duration);
  }

  const rawObj = raw as Record<string, unknown>;
  const rawScenes =
    Array.isArray(rawObj.scenes) && rawObj.scenes.length > 0
      ? (rawObj.scenes as Array<Record<string, unknown>>)
      : null;

  if (!rawScenes) {
    return createBaselinePlan(duration);
  }

  const title =
    typeof rawObj.title === "string" && rawObj.title.trim()
      ? rawObj.title.trim()
      : "Visual Music Storyboard";
  const visualConcept =
    typeof rawObj.visualConcept === "string" && rawObj.visualConcept.trim()
      ? rawObj.visualConcept.trim()
      : "Cinematic music video narrative";
  const visualStyle =
    typeof rawObj.visualStyle === "string" && rawObj.visualStyle.trim()
      ? rawObj.visualStyle.trim()
      : "Cinematic";
  const mood =
    typeof rawObj.mood === "string" && rawObj.mood.trim()
      ? rawObj.mood.trim()
      : "Atmospheric";
  const colorPalette =
    Array.isArray(rawObj.colorPalette) && rawObj.colorPalette.length > 0
      ? rawObj.colorPalette.map(String)
      : ["#0f172a", "#ec4899", "#8b5cf6"];
  const continuityGuidelines =
    typeof rawObj.continuityGuidelines === "string" && rawObj.continuityGuidelines.trim()
      ? rawObj.continuityGuidelines.trim()
      : "Maintain consistent characters and color grading";

  const sceneCount = rawScenes.length;
  const defaultSceneDuration = duration / Math.max(1, sceneCount);

  let currentStart = 0;
  const sanitizedScenes: PlannedScene[] = rawScenes.map((sc, idx) => {
    const isLast = idx === sceneCount - 1;
    const rawStart = typeof sc.startTime === "number" ? Math.max(0, sc.startTime) : currentStart;
    const rawEnd = typeof sc.endTime === "number" ? sc.endTime : rawStart + defaultSceneDuration;
    let rawDur = typeof sc.duration === "number" ? sc.duration : rawEnd - rawStart;
    if (rawDur <= 0) rawDur = defaultSceneDuration;

    const start = Math.round(currentStart * 100) / 100;
    const end = isLast
      ? duration
      : Math.min(duration, Math.round((currentStart + rawDur) * 100) / 100);

    const actualDuration = Math.max(0.5, Math.round((end - start) * 100) / 100);
    currentStart = end;

    const prompt =
      typeof sc.prompt === "string" && sc.prompt.trim()
        ? sc.prompt.trim()
        : `Cinematic ${visualStyle} scene visual ${idx + 1}, ultra-detailed, 8k, photorealistic`;

    return {
      id: typeof sc.id === "string" && sc.id.trim() ? sc.id : generateId(),
      order: idx,
      startTime: start,
      endTime: end,
      duration: actualDuration,
      prompt,
      negativePrompt: typeof sc.negativePrompt === "string" ? sc.negativePrompt : undefined,
      mood: typeof sc.mood === "string" ? sc.mood : mood,
      camera:
        typeof sc.camera === "string"
          ? sc.camera
          : idx % 2 === 0
          ? "Slow Dolly In"
          : "Dynamic Orbit",
      transition: typeof sc.transition === "string" ? sc.transition : "fade",
      transitionDuration:
        typeof sc.transitionDuration === "number" ? Math.min(1.0, sc.transitionDuration) : 0.5,
      captionSuggestions: Array.isArray(sc.captionSuggestions)
        ? sc.captionSuggestions.map(String)
        : [],
      visualContinuityNotes:
        typeof sc.visualContinuityNotes === "string"
          ? sc.visualContinuityNotes
          : continuityGuidelines,
      imageUrl: typeof sc.imageUrl === "string" ? sc.imageUrl : undefined,
    };
  });

  // Ensure last scene extends to full duration
  if (sanitizedScenes.length > 0) {
    sanitizedScenes[sanitizedScenes.length - 1].endTime = duration;
    sanitizedScenes[sanitizedScenes.length - 1].duration =
      Math.round((duration - sanitizedScenes[sanitizedScenes.length - 1].startTime) * 100) / 100;
  }

  return {
    title,
    visualConcept,
    visualStyle,
    mood,
    colorPalette,
    continuityGuidelines,
    totalDuration: duration,
    scenes: sanitizedScenes,
    createdAt:
      typeof rawObj.createdAt === "string" ? rawObj.createdAt : new Date().toISOString(),
  };
}

