import type { MusicProvider } from "./types";
import type { MusicProviderType, SearchOptions, SearchResult, NormalizedTrack } from "@musicmotion/shared";
import { LicensedMusicProvider } from "./licensed";
import { SpotifyMusicProvider } from "./spotify";
import { AppleMusicProvider } from "./apple";
import { UserUploadMusicProvider } from "./user-upload";
import { musicRateLimiter } from "./rateLimiter";

export class MusicProviderRegistry {
  private static instance: MusicProviderRegistry;
  private providers = new Map<MusicProviderType, MusicProvider>();
  private defaultProviderId: MusicProviderType = "licensed";

  private constructor() {
    // 1. Register Core Providers
    const licensed = new LicensedMusicProvider();
    const spotify = new SpotifyMusicProvider();
    const apple = new AppleMusicProvider();
    const upload = new UserUploadMusicProvider();

    this.register(licensed);
    this.register(spotify);
    this.register(apple);
    this.register(upload);

    // Aliases for backwards compatibility
    this.providers.set("jamendo", licensed);
    this.providers.set("upload", upload);

    // Configure default provider from environment if specified
    const envProvider = process.env.MUSIC_PROVIDER as MusicProviderType | undefined;
    if (envProvider && this.providers.has(envProvider)) {
      this.defaultProviderId = envProvider;
    }
  }

  public static getInstance(): MusicProviderRegistry {
    if (!MusicProviderRegistry.instance) {
      MusicProviderRegistry.instance = new MusicProviderRegistry();
    }
    return MusicProviderRegistry.instance;
  }

  public register(provider: MusicProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id?: MusicProviderType): MusicProvider {
    const targetId = id || this.defaultProviderId;
    const provider = this.providers.get(targetId);
    if (!provider) {
      // Fallback to licensed provider
      const fallback = this.providers.get("licensed");
      if (fallback) return fallback;
      throw new Error(`Music provider "${targetId}" is not registered.`);
    }
    return provider;
  }

  public getAllProviders(): MusicProvider[] {
    return Array.from(new Set(this.providers.values()));
  }

  public getDefaultProviderId(): MusicProviderType {
    return this.defaultProviderId;
  }

  public setDefaultProviderId(id: MusicProviderType): void {
    if (this.providers.has(id)) {
      this.defaultProviderId = id;
    }
  }

  /**
   * Searches tracks across preferred provider with automatic fallback if rate-limited or unconfigured
   */
  public async searchWithFallback(query: string, options?: SearchOptions): Promise<SearchResult> {
    const primaryId = options?.provider || this.defaultProviderId;
    const primaryProvider = this.getProvider(primaryId);

    // Check rate limiter
    if (!musicRateLimiter.isAllowed(primaryId)) {
      console.warn(`Rate limit exceeded for provider: ${primaryId}. Attempting fallback.`);
      return this.executeFallbackSearch(query, options, [primaryId]);
    }

    try {
      const result = await primaryProvider.searchTracks(query, options);
      if (result.tracks.length > 0 || !query) {
        return result;
      }
      // If primary returns empty results, attempt fallback search
      return this.executeFallbackSearch(query, options, [primaryId]);
    } catch (err) {
      console.error(`Error with primary provider ${primaryId}:`, err);
      return this.executeFallbackSearch(query, options, [primaryId]);
    }
  }

  private async executeFallbackSearch(
    query: string,
    options?: SearchOptions,
    excludedIds: MusicProviderType[] = []
  ): Promise<SearchResult> {
    const fallbacks: MusicProviderType[] = ["licensed", "apple", "spotify", "user-upload"];

    for (const providerId of fallbacks) {
      if (excludedIds.includes(providerId)) continue;
      if (!musicRateLimiter.isAllowed(providerId)) continue;

      try {
        const provider = this.getProvider(providerId);
        const result = await provider.searchTracks(query, options);
        if (result.tracks.length > 0) {
          return {
            ...result,
            provider: providerId,
          };
        }
      } catch (err) {
        console.warn(`Fallback to ${providerId} failed:`, err);
      }
    }

    return {
      tracks: [],
      total: 0,
      hasMore: false,
      provider: "licensed",
    };
  }

  /**
   * Retrieves single track across all registered providers
   */
  public async getTrackAcrossProviders(id: string): Promise<NormalizedTrack | null> {
    // Check prefix
    if (id.startsWith("spotify-")) {
      return this.getProvider("spotify").getTrack(id);
    }
    if (id.startsWith("apple-")) {
      return this.getProvider("apple").getTrack(id);
    }
    if (id.startsWith("licensed-") || id.startsWith("jamendo-")) {
      return this.getProvider("licensed").getTrack(id);
    }
    if (id.startsWith("upload-")) {
      return this.getProvider("user-upload").getTrack(id);
    }

    // Try all providers sequentially
    for (const provider of this.getAllProviders()) {
      try {
        const track = await provider.getTrack(id);
        if (track) return track;
      } catch {
        // continue
      }
    }

    return null;
  }
}

export const musicProviders = MusicProviderRegistry.getInstance();
