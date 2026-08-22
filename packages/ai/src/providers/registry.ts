import type { IAISceneProvider, AISceneProviderType } from "./types";
import { OpenAISceneProvider } from "./openai";

export class AIProviderRegistry {
  private static instance: AIProviderRegistry;
  private providers = new Map<AISceneProviderType, IAISceneProvider>();

  private constructor() {
    this.register(new OpenAISceneProvider());
  }

  public static getInstance(): AIProviderRegistry {
    if (!AIProviderRegistry.instance) {
      AIProviderRegistry.instance = new AIProviderRegistry();
    }
    return AIProviderRegistry.instance;
  }

  public register(provider: IAISceneProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: AISceneProviderType = "openai"): IAISceneProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`AI scene provider "${id}" is not registered.`);
    }
    return provider;
  }

  public getAllProviders(): IAISceneProvider[] {
    return Array.from(this.providers.values());
  }
}

export const aiProviders = AIProviderRegistry.getInstance();
