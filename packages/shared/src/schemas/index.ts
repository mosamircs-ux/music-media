import { z } from "zod";

export const LocaleSchema = z.enum(["en", "ar"]);
export const DirectionSchema = z.enum(["ltr", "rtl"]);

export const MusicProviderTypeSchema = z.enum(["jamendo", "freesound", "upload", "custom"]);

export const LicenseInfoSchema = z.object({
  type: z.string().min(1),
  url: z.string().url().optional(),
  attributionRequired: z.boolean(),
  commercialAllowed: z.boolean(),
  rawText: z.string().optional(),
});

export const TrackSchema = z.object({
  id: z.string().uuid(),
  provider: MusicProviderTypeSchema,
  externalId: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().optional(),
  duration: z.number().positive(),
  audioUrl: z.string().url(),
  waveformUrl: z.string().url().optional(),
  coverArtUrl: z.string().url().optional(),
  bpm: z.number().int().positive().optional(),
  tags: z.array(z.string()).optional(),
  license: LicenseInfoSchema,
});

export const TimeRangeSchema = z
  .object({
    start: z.number().min(0),
    end: z.number().positive(),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be greater than start time",
    path: ["end"],
  });

export const TrackSelectionSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  trackId: z.string().uuid(),
  track: TrackSchema.optional(),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  fadeInDuration: z.number().min(0).optional(),
  fadeOutDuration: z.number().min(0).optional(),
});

export const CaptionPositionSchema = z.enum(["top", "center", "bottom"]);
export const CaptionAnimationSchema = z.enum(["none", "fade", "pop", "typewriter", "karaoke"]);

export const CaptionStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  textColor: z.string(),
  backgroundColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  position: CaptionPositionSchema,
  animation: CaptionAnimationSchema,
  textTransform: z.enum(["uppercase", "lowercase", "capitalize", "none"]).optional(),
});

export const CaptionSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  text: z.string().min(1),
  style: CaptionStyleSchema.partial().optional(),
});

export const TransitionTypeSchema = z.enum([
  "fade",
  "dissolve",
  "slide_left",
  "slide_right",
  "zoom_in",
  "zoom_out",
  "cut",
]);

export const TransitionSchema = z.object({
  type: TransitionTypeSchema,
  duration: z.number().min(0).max(3).default(0.5),
});

export const SceneSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  prompt: z.string().min(1),
  enhancedPrompt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(0),
  duration: z.number().positive(),
  transition: TransitionSchema.optional(),
  status: z.enum(["idle", "generating", "completed", "failed"]),
});

export const AspectRatioSchema = z.enum(["9:16", "16:9", "1:1"]);

export const VideoConfigSchema = z.object({
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  fps: z.number().int().positive().default(30),
  aspectRatio: AspectRatioSchema.default("9:16"),
  duration: z.number().positive(),
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(["draft", "ready", "rendering", "completed", "failed"]),
  locale: LocaleSchema.default("en"),
  trackSelection: TrackSelectionSchema.optional(),
  captions: z.array(CaptionSchema),
  scenes: z.array(SceneSchema),
  videoConfig: VideoConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
