import type {
  NormalizedTrack,
  Track,
  SearchOptions,
  SearchResult,
  SearchTracksParams,
  SearchTracksResult,
  LicenseInfo,
  MusicProviderType,
  Artist,
  Album,
  TrackAvailability,
} from "@musicmotion/shared";

export interface MusicProviderConfig {
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
}

export interface MusicProvider {
  readonly id: MusicProviderType;
  readonly name: string;
  readonly isLicensedForVideo: boolean;

  /**
   * Search tracks with optional pagination and filters
   */
  searchTracks(query: string, options?: SearchOptions): Promise<SearchResult>;

  /**
   * Get single normalized track by ID
   */
  getTrack(id: string): Promise<NormalizedTrack | null>;

  /**
   * Get artist details by ID
   */
  getArtist(id: string): Promise<Artist | null>;

  /**
   * Get album details by ID
   */
  getAlbum(id: string): Promise<Album | null>;

  /**
   * Get legal preview audio URL (e.g. 30s sample)
   */
  getPreview(trackId: string): Promise<string | null>;

  /**
   * Get lyrics where legally available
   */
  getLyrics(trackId: string): Promise<string | null>;

  /**
   * Check track availability and licensing for video rendering
   */
  getAvailability(trackId: string): Promise<TrackAvailability>;

  // Backwards compatibility aliases
  search?(params: SearchTracksParams): Promise<SearchTracksResult>;
  getTrackById?(id: string): Promise<Track | null>;
  getStreamUrl?(track: Track): Promise<string>;
  getLicenseDetails?(track: Track): Promise<LicenseInfo>;
}

// Backward compatibility alias
export type IMusicProvider = MusicProvider;

