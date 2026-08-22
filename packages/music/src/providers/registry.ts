import type { IMusicProvider } from "./types";
import type { MusicProviderType } from "@musicmotion/shared";
import { JamendoMusicProvider } from "./jamendo";
import { UploadMusicProvider } from "./upload";

export class MusicProviderRegistry {
  private static instance: MusicProviderRegistry;
  private providers = new Map<MusicProviderType, IMusicProvider>();

  private constructor() {
    this.register(new JamendoMusicProvider());
    this.register(new UploadMusicProvider());
  }

  public static getInstance(): MusicProviderRegistry {
    if (!MusicProviderRegistry.instance) {
      MusicProviderRegistry.instance = new MusicProviderRegistry();
    }
    return MusicProviderRegistry.instance;
  }

  public register(provider: IMusicProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: MusicProviderType): IMusicProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Music provider "${id}" is not registered.`);
    }
    return provider;
  }

  public getAllProviders(): IMusicProvider[] {
    return Array.from(this.providers.values());
  }
}

export const musicProviders = MusicProviderRegistry.getInstance();
