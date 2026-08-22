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
  id: z.string(),
  provider: MusicProviderTypeSchema,
  externalId: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().optional(),
  duration: z.number().positive(),
  audioUrl: z.string(),
  waveformUrl: z.string().optional(),
  coverArtUrl: z.string().optional(),
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
  id: z.string(),
  projectId: z.string(),
  trackId: z.string(),
  track: TrackSchema.optional(),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  fadeInDuration: z.number().min(0).optional(),
  fadeOutDuration: z.number().min(0).optional(),
  volume: z.number().min(0).max(1).optional(),
});

export const CaptionPositionSchema = z.enum(["top", "center", "bottom"]);
export const CaptionAnimationSchema = z.enum(["none", "fade", "pop", "typewriter", "karaoke", "bounce"]);
export const CaptionAlignmentSchema = z.enum(["left", "center", "right"]);
export const CaptionFontWeightSchema = z.enum(["normal", "medium", "semibold", "bold", "extrabold"]);

export const CaptionStyleSchema = z.object({
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  fontWeight: CaptionFontWeightSchema.default("bold"),
  alignment: CaptionAlignmentSchema.default("center"),
  textColor: z.string(),
  backgroundColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  position: CaptionPositionSchema,
  animation: CaptionAnimationSchema,
  textTransform: z.enum(["uppercase", "lowercase", "capitalize", "none"]).optional(),
});

export const CaptionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  text: z.string().min(1),
  style: CaptionStyleSchema.partial().optional(),
});

export const VisualStyleSchema = z.enum([
  "Cinematic",
  "Anime",
  "Realistic",
  "Dreamy",
  "Dark",
  "Retro",
  "Fantasy",
  "Minimal",
  "Music Video",
]);

export const TransitionTypeSchema = z.enum([
  "fade",
  "dissolve",
  "slide_left",
  "slide_right",
  "zoom_in",
  "zoom_out",
  "glitch",
  "cut",
]);

export const TransitionSchema = z.object({
  type: TransitionTypeSchema,
  duration: z.number().min(0).max(3).default(0.5),
});

export const SceneSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  prompt: z.string().min(1),
  enhancedPrompt: z.string().optional(),
  visualStyle: VisualStyleSchema.optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
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
  resolution: z.enum(["720p", "1080p", "4k"]).default("1080p"),
  codec: z.enum(["h264", "h265"]).default("h264"),
  watermark: z.boolean().default(false),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: z.enum(["draft", "ready", "rendering", "completed", "failed"]),
  locale: LocaleSchema.default("en"),
  trackSelection: TrackSelectionSchema.optional(),
  captions: z.array(CaptionSchema),
  scenes: z.array(SceneSchema),
  videoConfig: VideoConfigSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  thumbnailUrl: z.string().optional(),
  outputVideoUrl: z.string().optional(),
});
