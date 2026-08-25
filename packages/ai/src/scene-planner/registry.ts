import type {
  AIProvider,
  ScenePlan,
  ScenePlanInput,
  ScenePromptContext,
  CaptionStyleSuggestion,
  MusicAnalysisResult,
  NormalizedTrack,
} from "@musicmotion/shared";
import { GenericAIProvider } from "./providers/generic";
import { OpenAIProvider } from "./providers/openai";

/**
 * Registry & Orchestrator for AI Scene Planning Providers.
 * Provides resilient provider switching, fallback execution, and load balancing.
 */
export class AIScenePlannerRegistry {
  private static instance: AIScenePlannerRegistry;
  private providers = new Map<string, AIProvider>();
  private defaultProviderId: string;

  private constructor() {
    // Register primary providers
    const generic = new GenericAIProvider();
    const openai = new OpenAIProvider();

    this.register(generic);
    this.register(openai);

    // Determine default provider from env or fallback to generic
    const envProvider = process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY ? "openai" : "generic");
    this.defaultProviderId = this.providers.has(envProvider) ? envProvider : "generic";
  }

  public static getInstance(): AIScenePlannerRegistry {
    if (!AIScenePlannerRegistry.instance) {
      AIScenePlannerRegistry.instance = new AIScenePlannerRegistry();
    }
    return AIScenePlannerRegistry.instance;
  }

  public register(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id?: string): AIProvider {
    const targetId = id || this.defaultProviderId;
    const provider = this.providers.get(targetId) || this.providers.get("generic");
    if (!provider) {
      throw new Error(`AI Scene Planner provider "${targetId}" is not available.`);
    }
    return provider;
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Generates a scene plan using the preferred provider, with automatic fallback
   * to the algorithmic GenericAIProvider if any unexpected error occurs.
   */
  public async generateScenePlanWithFallback(
    input: ScenePlanInput,
    preferredProviderId?: string
  ): Promise<ScenePlan> {
    const provider = this.getProvider(preferredProviderId);

    try {
      return await provider.generateScenePlan(input);
    } catch (err) {
      console.warn(
        `Scene planning failed on provider "${provider.id}" (${(err as Error).message}). Executing fallback.`
      );
      const fallback = this.getProvider("generic");
      return await fallback.generateScenePlan(input);
    }
  }

  public async generateVisualPrompt(
    context: ScenePromptContext,
    preferredProviderId?: string
  ): Promise<string> {
    const provider = this.getProvider(preferredProviderId);
    return provider.generateVisualPrompt(context);
  }

  public async generateCaptionStyle(
    track: NormalizedTrack,
    visualStyle: string,
    preferredProviderId?: string
  ): Promise<CaptionStyleSuggestion> {
    const provider = this.getProvider(preferredProviderId);
    return provider.generateCaptionStyle(track, visualStyle);
  }

  public async analyzeMusic(
    track: NormalizedTrack,
    lyrics?: string[],
    preferredProviderId?: string
  ): Promise<MusicAnalysisResult> {
    const provider = this.getProvider(preferredProviderId);
    return provider.analyzeMusic(track, lyrics);
  }
}

export const aiScenePlanner = AIScenePlannerRegistry.getInstance();
