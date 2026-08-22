export type AISceneProviderType = "openai" | "stability" | "replicate" | "custom";

export interface GenerateSceneOptions {
  aspectRatio?: "9:16" | "16:9" | "1:1";
  style?: string;
  negativePrompt?: string;
  musicGenre?: string;
  musicMood?: string;
}

export interface GeneratedVisual {
  imageUrl: string;
  prompt: string;
  revisedPrompt?: string;
  provider: AISceneProviderType;
}

export interface IAISceneProvider {
  readonly id: AISceneProviderType;
  readonly name: string;

  generateImage(prompt: string, options?: GenerateSceneOptions): Promise<GeneratedVisual>;
  enhancePrompt(captionText: string, context?: { mood?: string; genre?: string }): Promise<string>;
}
