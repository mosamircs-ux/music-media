/**
 * Supported Locales and Text Direction
 */
export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

/**
 * Music Track & Provider
 */
export type MusicProviderType = "jamendo" | "freesound" | "upload" | "custom";

export interface LicenseInfo {
  type: string;
  url?: string;
  attributionRequired: boolean;
  commercialAllowed: boolean;
  rawText?: string;
}

export interface Track {
  id: string;
  provider: MusicProviderType;
  externalId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // in seconds
  audioUrl: string;
  waveformUrl?: string;
  coverArtUrl?: string;
  bpm?: number;
  tags?: string[];
  license: LicenseInfo;
}

export interface SearchTracksParams {
  query?: string;
  tags?: string[];
  bpmMin?: number;
  bpmMax?: number;
  limit?: number;
  offset?: number;
}

export interface SearchTracksResult {
  tracks: Track[];
  total: number;
  hasMore: boolean;
}

/**
 * Audio Trimming & Selection
 */
export interface TimeRange {
  start: number; // in seconds
  end: number;   // in seconds
}

export interface TrackSelection {
  id: string;
  projectId: string;
  trackId: string;
  track?: Track;
  startTime: number;
  endTime: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

/**
 * Captions & Timing
 */
export type CaptionPosition = "top" | "center" | "bottom";
export type CaptionAnimation = "none" | "fade" | "pop" | "typewriter" | "karaoke";

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  position: CaptionPosition;
  animation: CaptionAnimation;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
}

export interface Caption {
  id: string;
  projectId: string;
  startTime: number; // relative to selection start (0-based)
  endTime: number;
  text: string;
  style?: Partial<CaptionStyle>;
}

/**
 * AI Visual Scenes & Transitions
 */
export type TransitionType = "fade" | "dissolve" | "slide_left" | "slide_right" | "zoom_in" | "zoom_out" | "cut";

export interface Transition {
  type: TransitionType;
  duration: number; // in seconds, default ~0.5
}

export interface Scene {
  id: string;
  projectId: string;
  prompt: string;
  enhancedPrompt?: string;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  duration: number; // in seconds
  transition?: Transition;
  status: "idle" | "generating" | "completed" | "failed";
}

/**
 * Video Rendering & Project Settings
 */
export type AspectRatio = "9:16" | "16:9" | "1:1";

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  aspectRatio: AspectRatio;
  duration: number; // calculated from selection duration
}

export type ProjectStatus = "draft" | "ready" | "rendering" | "completed" | "failed";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  locale: Locale;
  trackSelection?: TrackSelection;
  captions: Caption[];
  scenes: Scene[];
  videoConfig: VideoConfig;
  createdAt: string;
  updatedAt: string;
}

export type RenderJobStatus = "queued" | "processing" | "rendering" | "encoding" | "completed" | "failed";

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderJobStatus;
  progress: number; // 0 - 100
  outputUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
