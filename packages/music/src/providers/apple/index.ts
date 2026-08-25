import type { MusicProvider, MusicProviderConfig } from "../types";
import type {
  NormalizedTrack,
  SearchOptions,
  SearchResult,
  Artist,
  Album,
  TrackAvailability,
  LicenseInfo,
  MusicProviderType,
} from "@musicmotion/shared";

import { musicCache } from "../cache";

interface ITunesTrackResult {
  trackId: number;
  trackName: string;
  artistId?: number;
  artistName: string;
  collectionId?: number;
  collectionName?: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  primaryGenreName?: string;
  trackViewUrl?: string;
  releaseDate?: string;
}

interface ITunesSearchResponse {
  resultCount: number;
  results: ITunesTrackResult[];
}

export class AppleMusicProvider implements MusicProvider {
  readonly id: MusicProviderType = "apple";
  readonly name: string = "Apple Music / iTunes API";
  readonly isLicensedForVideo = false; // Discovery & Preview only


  private baseUrl = "https://itunes.apple.com";

  constructor(_config?: MusicProviderConfig) {
    // iTunes Search API is open for public track discovery
  }

  async searchTracks(query: string, options?: SearchOptions): Promise<SearchResult> {
    const cacheKey = `apple:search:${query}:${options?.limit || 20}:${options?.offset || 0}`;
    const cached = musicCache.get<SearchResult>(cacheKey);
    if (cached) return cached;

    const limit = Math.min(options?.limit || 20, 50);
    const searchUrl = new URL(`${this.baseUrl}/search`);
    searchUrl.searchParams.set("term", query || "top hits");
    searchUrl.searchParams.set("media", "music");
    searchUrl.searchParams.set("entity", "song");
    searchUrl.searchParams.set("limit", String(limit));

    try {
      const res = await fetch(searchUrl.toString());
      if (!res.ok) {
        throw new Error(`Apple Music Search failed: ${res.status} ${res.statusText}`);
      }

      const data: ITunesSearchResponse = await res.json();
      const tracks: NormalizedTrack[] = data.results.map((item) => this.mapAppleTrack(item));

      const result: SearchResult = {
        tracks,
        total: data.resultCount,
        hasMore: data.resultCount === limit,
        page: options?.offset ? Math.floor(options.offset / limit) + 1 : 1,
        provider: "apple",
      };

      musicCache.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error("Apple Music searchTracks error:", error);
      return {
        tracks: [],
        total: 0,
        hasMore: false,
        provider: "apple",
      };
    }
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    const rawId = id.replace(/^apple-/, "");
    const cacheKey = `apple:track:${rawId}`;
    const cached = musicCache.get<NormalizedTrack>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.baseUrl}/lookup?id=${rawId}`);
      if (!res.ok) return null;

      const data: ITunesSearchResponse = await res.json();
      if (!data.results || data.results.length === 0) return null;

      const track = this.mapAppleTrack(data.results[0]);
      musicCache.set(cacheKey, track, 600);
      return track;
    } catch (error) {
      console.error(`Error retrieving Apple Music track ${id}:`, error);
      return null;
    }
  }

  async getArtist(id: string): Promise<Artist | null> {
    const rawId = id.replace(/^apple-artist-/, "");
    const cacheKey = `apple:artist:${rawId}`;
    const cached = musicCache.get<Artist>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.baseUrl}/lookup?id=${rawId}&entity=musicArtist`);
      if (!res.ok) return null;

      const data: ITunesSearchResponse = await res.json();
      if (!data.results || data.results.length === 0) return null;

      const item = data.results[0];
      const artist: Artist = {
        id: `apple-artist-${item.artistId || rawId}`,
        name: item.artistName,
        genre: item.primaryGenreName,
        externalUrl: item.trackViewUrl,
      };

      musicCache.set(cacheKey, artist, 1800);
      return artist;
    } catch (error) {
      console.error(`Error retrieving Apple Music artist ${id}:`, error);
      return null;
    }
  }

  async getAlbum(id: string): Promise<Album | null> {
    const rawId = id.replace(/^apple-album-/, "");
    const cacheKey = `apple:album:${rawId}`;
    const cached = musicCache.get<Album>(cacheKey);
    if (cached) return cached;

    try {
      const res = await fetch(`${this.baseUrl}/lookup?id=${rawId}&entity=album`);
      if (!res.ok) return null;

      const data: ITunesSearchResponse = await res.json();
      if (!data.results || data.results.length === 0) return null;

      const item = data.results[0];
      const artwork = item.artworkUrl100?.replace("100x100bb.jpg", "600x600bb.jpg");
      const album: Album = {
        id: `apple-album-${item.collectionId || rawId}`,
        title: item.collectionName || "Unknown Album",
        artist: item.artistName,
        artists: [item.artistName],
        coverArtUrl: artwork,
        albumArt: artwork,
        genre: item.primaryGenreName,
        releaseYear: item.releaseDate ? parseInt(item.releaseDate.slice(0, 4), 10) : undefined,
        externalUrl: item.trackViewUrl,
      };

      musicCache.set(cacheKey, album, 1800);
      return album;
    } catch (error) {
      console.error(`Error retrieving Apple Music album ${id}:`, error);
      return null;
    }
  }

  async getPreview(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track?.previewUrl || null;
  }

  async getLyrics(_trackId: string): Promise<string | null> {
    return null;
  }

  async getAvailability(trackId: string): Promise<TrackAvailability> {
    const track = await this.getTrack(trackId);
    if (!track) {
      return {
        isAvailable: false,
        isAvailableForVideo: false,
        reason: "Track not found on Apple Music",
        previewAvailable: false,
      };
    }

    return {
      isAvailable: true,
      isAvailableForVideo: false,
      reason: "Apple Music catalog is for discovery & 30s preview only. Use CC/Licensed tracks for video creation.",
      previewAvailable: Boolean(track.previewUrl),
    };
  }

  private mapAppleTrack(item: ITunesTrackResult): NormalizedTrack {
    const artwork = item.artworkUrl100 ? item.artworkUrl100.replace("100x100bb.jpg", "600x600bb.jpg") : undefined;
    const duration = item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180;

    const license: LicenseInfo = {
      type: "Apple Music Preview License",
      url: item.trackViewUrl,
      attributionRequired: true,
      commercialAllowed: false,
      rawText: `Metadata and preview audio provided by Apple Music API. Copyright belongs to respective artists and labels.`,
      notice: "Discovery & preview only. Not cleared for video export synchronization.",
    };

    return {
      id: `apple-${item.trackId}`,
      provider: "apple",
      externalId: String(item.trackId),
      title: item.trackName,
      artist: item.artistName,
      artists: [item.artistName],
      album: item.collectionName,
      albumArt: artwork,
      coverArtUrl: artwork,
      duration,
      previewUrl: item.previewUrl,
      audioUrl: item.previewUrl,
      tags: item.primaryGenreName ? [item.primaryGenreName] : [],
      isAvailableForVideo: false,
      licenseInfo: license,
      license,
    };

  }
}
