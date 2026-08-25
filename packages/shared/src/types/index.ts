/**
 * Supported Locales and Text Direction
 */
export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

/**
 * Music Track & Provider Types
 */
export type MusicProviderType =
  | "spotify"
  | "apple"
  | "licensed"
  | "user-upload"
  | "jamendo"
  | "freesound"
  | "upload"
  | "custom";

export interface LicenseInfo {
  type: string;
  url?: string;
  attributionRequired: boolean;
  commercialAllowed: boolean;
  rawText?: string;
  notice?: string;
}

export interface TrackAvailability {
  isAvailable: boolean;
  isAvailableForVideo: boolean;
  reason?: string;
  previewAvailable: boolean;
}

export interface Artist {
  id: string;
  name: string;
  genre?: string;
  avatarUrl?: string;
  monthlyListeners?: string;
  externalUrl?: string;
  tracksCount?: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artists?: string[];
  coverArtUrl?: string;
  albumArt?: string;
  releaseYear?: number;
  genre?: string;
  totalTracks?: number;
  externalUrl?: string;
}

export interface NormalizedTrack {
  id: string;
  provider: MusicProviderType;
  externalId: string;
  title: string;
  artist: string;
  artists: string[];
  album?: string;
  albumArt?: string;
  coverArtUrl?: string; // backwards compatibility alias for albumArt
  duration: number; // in seconds
  previewUrl?: string;
  audioUrl?: string; // backwards compatibility alias for previewUrl
  waveformUrl?: string;
  bpm?: number;
  tags?: string[];
  genre?: string;
  mood?: string;
  tempo?: string;
  isAvailableForVideo: boolean;
  licenseInfo: LicenseInfo;
  license: LicenseInfo; // backwards compatibility alias for licenseInfo
  lyrics?: string;
}


// Backward compatibility Track alias
export type Track = NormalizedTrack;

export interface SearchTracksParams {
  query?: string;
  tags?: string[];
  genre?: string;
  bpmMin?: number;
  bpmMax?: number;
  limit?: number;
  offset?: number;
  provider?: MusicProviderType;
}

export type SearchOptions = SearchTracksParams;

export interface SearchTracksResult {
  tracks: NormalizedTrack[];
  total: number;
  hasMore: boolean;
  page?: number;
  provider?: MusicProviderType;
}

export type SearchResult = SearchTracksResult;


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
  volume?: number; // 0 to 1
}

/**
 * Captions & Timing
 */
export type CaptionPosition = "top" | "center" | "bottom";

export type CaptionPresetStyle =
  | "Modern"
  | "Minimal"
  | "Karaoke"
  | "Cinematic"
  | "Neon"
  | "Bold"
  | "Typewriter"
  | "Elegant";

export type CaptionAnimation =
  | "Fade"
  | "Slide Up"
  | "Slide Down"
  | "Pop"
  | "Typewriter"
  | "Word-by-word"
  | "Karaoke"
  | "none"
  | "fade"
  | "pop"
  | "typewriter"
  | "karaoke"
  | "slide_up"
  | "slide_down"
  | "word_by_word";

export type CaptionAlignment = "left" | "center" | "right";
export type CaptionFontWeight = "normal" | "medium" | "semibold" | "bold" | "extrabold" | "black";

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: CaptionFontWeight;
  alignment: CaptionAlignment;
  textColor: string;
  color?: string; // alias for textColor
  backgroundColor?: string;
  background?: string; // alias for backgroundColor
  strokeColor?: string;
  strokeWidth?: number;
  position: CaptionPosition;
  animation: CaptionAnimation;
  stylePreset?: CaptionPresetStyle;
  style?: CaptionPresetStyle; // alias for stylePreset
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  isRTL?: boolean;
}

export interface Caption {
  id: string;
  projectId: string;
  startTime: number; // relative to selection start (in seconds)
  endTime: number;   // relative to selection start (in seconds)
  text: string;
  style?: CaptionPresetStyle;
  animation?: CaptionAnimation;
  position?: CaptionPosition;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: CaptionFontWeight;
  color?: string;
  background?: string;
  alignment?: CaptionAlignment;
  isRTL?: boolean;
  styleConfig?: Partial<CaptionStyle>;
}

export interface CaptionGenerationOptions {
  language?: string;
  style?: CaptionPresetStyle;
  maxWordsPerCaption?: number;
  duration?: number;
  bpm?: number;
}

export interface AutoCaptionResult {
  captions: Caption[];
  provider: string;
  language: string;
  confidence?: number;
}

export interface AutoCaptionProvider {
  readonly id: string;
  readonly name: string;
  generateCaptions(track: NormalizedTrack, options?: CaptionGenerationOptions): Promise<AutoCaptionResult>;
}


/**
 * AI Visual Styles & Scene Generation
 */
export type VisualStyle =
  | "Cinematic"
  | "Anime"
  | "Realistic"
  | "Dreamy"
  | "Dark"
  | "Retro"
  | "Fantasy"
  | "Minimal"
  | "Music Video";

export type TransitionType =
  | "fade"
  | "dissolve"
  | "slide_left"
  | "slide_right"
  | "zoom_in"
  | "zoom_out"
  | "glitch"
  | "cut";

export interface Transition {
  type: TransitionType;
  duration: number; // in seconds, default ~0.5
}

export interface Scene {
  id: string;
  projectId: string;
  prompt: string;
  enhancedPrompt?: string;
  visualStyle?: VisualStyle;
  imageUrl?: string;
  videoUrl?: string;
  order: number;
  duration: number; // in seconds
  startTime?: number;
  endTime?: number;
  mood?: string;
  camera?: string;
  transition?: Transition;
  status: "idle" | "generating" | "completed" | "failed";
}

/**
 * AI Scene Planning & Storyboard
 */
export interface PlannedScene {
  id: string;
  order: number;
  startTime: number;
  endTime: number;
  duration: number;
  prompt: string;
  negativePrompt?: string;
  mood: string;
  camera: string;
  transition: TransitionType | string;
  transitionDuration?: number;
  captionSuggestions?: string[];
  visualContinuityNotes?: string;
  imageUrl?: string;
}

export interface ScenePlan {
  title: string;
  visualConcept: string;
  visualStyle: VisualStyle | string;
  mood: string;
  colorPalette: string[];
  continuityGuidelines: string;
  totalDuration: number;
  scenes: PlannedScene[];
  createdAt?: string;
}

export interface ScenePlanInput {
  track: NormalizedTrack;
  startTime: number;
  endTime: number;
  duration?: number;
  captions?: Caption[];
  visualStyle?: VisualStyle | string;
  userDescription?: string;
  referenceImage?: string;
  targetSceneCount?: number;
  aspectRatio?: AspectRatio;
}

export interface MusicAnalysisResult {
  genre: string;
  mood: string;
  energy: "low" | "medium" | "high" | "explosive";
  bpm?: number;
  suggestedPacing: "fast-cuts" | "medium-dynamic" | "slow-cinematic";
  recommendedSceneCount: number;
  storyTheme: string;
}

export interface ScenePromptContext {
  track: NormalizedTrack;
  visualStyle: string;
  sceneIndex: number;
  totalScenes: number;
  captionText?: string;
  mood?: string;
  camera?: string;
  previousPrompt?: string;
  continuityGuidelines?: string;
}

export interface CaptionStyleSuggestion {
  preset: CaptionPresetStyle;
  animation: CaptionAnimation;
  fontFamily: string;
  color: string;
  background: string;
  rationale: string;
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  generateScenePlan(input: ScenePlanInput): Promise<ScenePlan>;
  generateVisualPrompt(context: ScenePromptContext): Promise<string>;
  generateCaptionStyle(track: NormalizedTrack, visualStyle: string): Promise<CaptionStyleSuggestion>;
  analyzeMusic(track: NormalizedTrack, lyrics?: string[]): Promise<MusicAnalysisResult>;
}


/**
 * Visual Asset Generation
 */
export type AssetStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";
export type AssetType = "image" | "video";

export interface GeneratedAsset {
  id: string;
  projectId: string;
  sceneId: string;
  provider: string;
  type: AssetType;
  prompt: string;
  negativePrompt?: string;
  status: AssetStatus;
  /** URL returned by the provider (may be temporary) */
  sourceUrl?: string;
  /** URL of the asset stored in our own storage */
  storageUrl?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // seconds (for video assets)
  creditCost?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VisualGenerationRequest {
  sceneId: string;
  projectId: string;
  prompt: string;
  negativePrompt?: string;
  visualStyle?: VisualStyle | string;
  width?: number;
  height?: number;
  /** Number of inference steps (provider-specific, default 30) */
  steps?: number;
  /** Guidance scale (provider-specific, default 7.5) */
  guidanceScale?: number;
  /** Seed for reproducible generation */
  seed?: number;
}

export interface VisualGenerationResult {
  jobId: string;
  assetId: string;
  status: AssetStatus;
  progress: number; // 0–100
  sourceUrl?: string;
  storageUrl?: string;
  previewUrl?: string;
  width?: number;
  height?: number;
  error?: string;
}

export interface VisualGenerationProvider {
  readonly id: string;
  readonly name: string;
  readonly supportsVideo: boolean;
  generateImage(request: VisualGenerationRequest): Promise<VisualGenerationResult>;
  generateVideo?(request: VisualGenerationRequest): Promise<VisualGenerationResult>;
  getGenerationStatus(jobId: string): Promise<VisualGenerationResult>;
  cancelGeneration(jobId: string): Promise<{ cancelled: boolean }>;
}

/** Shape returned by GET /api/generate/status/[jobId] */
export interface GenerationJobStatus {
  jobId: string;
  assetId: string;
  sceneId: string;
  status: AssetStatus;
  progress: number;
  previewUrl?: string;
  storageUrl?: string;
  error?: string;
  updatedAt: string;
}

/**
 * Video Rendering & Project Settings
 */
export type AspectRatio = "9:16" | "16:9" | "1:1";
export type VideoResolution = "720p" | "1080p" | "4k";
export type VideoCodec = "h264" | "h265";

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  aspectRatio: AspectRatio;
  duration: number; // calculated from selection duration
  resolution?: VideoResolution;
  codec?: VideoCodec;
  watermark?: boolean;
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
  thumbnailUrl?: string;
  outputVideoUrl?: string;
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

/**
 * Video Templates
 */
export type TemplateCategory =
  | "all"
  | "reels"
  | "lyrics"
  | "visualizer"
  | "podcast"
  | "lofi"
  | "cinematic";

export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  scenesCount: number;
  defaultDuration: number;
  visualStyle: VisualStyle;
  aspectRatio: AspectRatio;
  musicGenre: string;
  tags: string[];
  rating: number;
  downloadsCount: number;
  isTrending?: boolean;
}

/**
 * User & Account & Billing
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: "free" | "creator" | "studio";
  creditsTotal: number;
  creditsRemaining: number;
  storageUsedBytes: number;
  storageLimitBytes: number;
  createdAt: string;
}

export interface PricingPlan {
  id: "free" | "creator" | "studio";
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnualMonthly: number; // discounted rate
  creditsMonthly: number;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}
