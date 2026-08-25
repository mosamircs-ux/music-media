import type {
  NormalizedTrack,
  Caption,
  CaptionPresetStyle,
  AutoCaptionProvider,
  AutoCaptionResult,
  CaptionGenerationOptions,
} from "@musicmotion/shared";

export type {
  AutoCaptionProvider,
  AutoCaptionResult,
  CaptionGenerationOptions,
  Caption,
  NormalizedTrack,
  CaptionPresetStyle,
};

export interface CaptionProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}
