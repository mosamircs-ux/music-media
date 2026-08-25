import type {
  AIProvider,
  ScenePlan,
  ScenePlanInput,
  ScenePromptContext,
  CaptionStyleSuggestion,
  MusicAnalysisResult,
  NormalizedTrack,
} from "@musicmotion/shared";

import { sanitizeScenePlan } from "../schemas";
import { GenericAIProvider } from "./generic";

export interface OpenAIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

interface OpenAIChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

/**
 * OpenAI GPT-4o / GPT-4o-mini AI Provider.
 * Implements structured output parsing, retry logic, timeout handling,
 * and automatic fallback to GenericAIProvider when credentials are unavailable.
 */
export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
  readonly name = "OpenAI GPT-4o Scene Planning Engine";

  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;
  private maxRetries: number;
  private fallbackProvider: GenericAIProvider;

  constructor(config?: OpenAIProviderConfig) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || "";
    this.baseUrl = config?.baseUrl || "https://api.openai.com/v1";
    this.model = config?.model || "gpt-4o-mini";
    this.timeoutMs = config?.timeoutMs || 25000;
    this.maxRetries = config?.maxRetries ?? 2;
    this.fallbackProvider = new GenericAIProvider();
  }

  async generateScenePlan(input: ScenePlanInput): Promise<ScenePlan> {
    const totalDuration = Math.max(
      1,
      input.duration || (input.endTime - input.startTime) || 15
    );

    // If no API key configured, use resilient algorithmic fallback
    if (!this.apiKey) {
      return this.fallbackProvider.generateScenePlan(input);
    }

    const systemPrompt = `You are an elite Hollywood music video director and AI visual prompt artist.
Your goal is to turn audio metadata, lyrics/captions, and creative direction into a continuous, cinematic multi-scene storyboard.

CRITICAL RULES:
1. Visual Continuity: Maintain consistent main characters, wardrobe, world building, and color grading across all scenes.
2. Timing Continuity: The total duration is EXACTLY ${totalDuration} seconds. Scenes must be sequential without gaps (e.g. 0.0 to 5.0, 5.0 to 10.0, 10.0 to ${totalDuration}).
3. Camera Directions: Include explicit cinematic camera motion for each scene (e.g., "Slow Dolly In", "Dynamic Orbit", "FPV Drone Pull-Back").
4. Transitions: Choose appropriate transitions ("fade", "dissolve", "zoom_in", "slide_left", "glitch", "cut").
5. Output ONLY valid, parseable JSON matching the requested schema.`;

    const userPrompt = `Track: "${input.track.title}" by ${input.track.artist}
Genre: ${input.track.genre || "Pop/Electronic"}, Mood: ${input.track.mood || "Energetic"}, BPM: ${input.track.bpm || 120}
Selected Clip Duration: ${totalDuration}s (from ${input.startTime}s to ${input.endTime}s)
Visual Style Preset: ${input.visualStyle || "Cinematic"}
User Creative Direction: "${input.userDescription || "Vibrant dynamic music visual narrative"}"
Captions/Lyrics in Segment:
${(input.captions || []).map((c) => `[${c.startTime}s - ${c.endTime}s]: "${c.text}"`).join("\n") || "None"}

Please output a JSON object with this exact structure:
{
  "title": "Short title for the story",
  "visualConcept": "1-2 sentences summarizing the visual storyline",
  "visualStyle": "${input.visualStyle || "Cinematic"}",
  "mood": "Overall emotional mood",
  "colorPalette": ["#hex1", "#hex2", "#hex3"],
  "continuityGuidelines": "Rules to preserve consistent look across all shots",
  "totalDuration": ${totalDuration},
  "scenes": [
    {
      "order": 0,
      "startTime": 0.0,
      "endTime": 5.0,
      "duration": 5.0,
      "prompt": "Detailed cinematic prompt for AI image generation (8k, photorealistic, lighting, 9:16 vertical)",
      "mood": "Scene mood",
      "camera": "Camera movement direction",
      "transition": "fade",
      "transitionDuration": 0.5,
      "visualContinuityNotes": "Why this matches previous scenes"
    }
  ]
}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const responseJson = await this.executeChatCompletion(
          systemPrompt,
          userPrompt,
          this.timeoutMs
        );

        const parsedJson = JSON.parse(responseJson);
        return sanitizeScenePlan(parsedJson, totalDuration);
      } catch (err) {
        lastError = err as Error;
        if (attempt < this.maxRetries) {
          // Exponential backoff: 300ms, 600ms...
          await new Promise((res) => setTimeout(res, 300 * Math.pow(2, attempt)));
        }
      }
    }

    console.warn(
      `OpenAI scene planning failed after ${this.maxRetries + 1} attempts (${lastError?.message}). Falling back to GenericAIProvider.`
    );
    return this.fallbackProvider.generateScenePlan(input);
  }

  async generateVisualPrompt(context: ScenePromptContext): Promise<string> {
    if (!this.apiKey) {
      return this.fallbackProvider.generateVisualPrompt(context);
    }

    const systemPrompt =
      "You are an expert AI prompt engineer for cinematic vertical music videos. Output only the final prompt string.";
    const userPrompt = `Music: "${context.track.title}" (${context.track.genre})
Style: ${context.visualStyle}
Scene ${context.sceneIndex + 1} of ${context.totalScenes}
Camera: ${context.camera || "Dynamic Motion"}
Lyric: "${context.captionText || ""}"
Continuity: ${context.continuityGuidelines || "Consistent visual language"}

Write a rich, photorealistic, cinematic prompt for 9:16 vertical video generation.`;

    try {
      const result = await this.executeChatCompletion(systemPrompt, userPrompt, 10000);
      return result.replace(/^["']|["']$/g, "").trim();
    } catch {
      return this.fallbackProvider.generateVisualPrompt(context);
    }
  }

  async generateCaptionStyle(
    track: NormalizedTrack,
    visualStyle: string
  ): Promise<CaptionStyleSuggestion> {
    return this.fallbackProvider.generateCaptionStyle(track, visualStyle);
  }

  async analyzeMusic(
    track: NormalizedTrack,
    lyrics?: string[]
  ): Promise<MusicAnalysisResult> {
    return this.fallbackProvider.analyzeMusic(track, lyrics);
  }

  private async executeChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    timeoutMs: number
  ): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data: OpenAIChatCompletionResponse = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error("OpenAI returned an empty response");
      }

      return content;
    } finally {
      clearTimeout(timer);
    }
  }
}
