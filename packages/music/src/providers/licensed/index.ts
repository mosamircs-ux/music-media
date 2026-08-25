import type { MusicProvider, MusicProviderConfig } from "../types";
import type {
  NormalizedTrack,
  SearchOptions,
  SearchResult,
  SearchTracksParams,
  SearchTracksResult,
  Artist,
  Album,
  TrackAvailability,
  LicenseInfo,
  MusicProviderType,
} from "@musicmotion/shared";

import { musicCache } from "../cache";

interface JamendoTrackApiResponse {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  artist_id?: string;
  album_name?: string;
  album_id?: string;
  album_image?: string;
  audio: string;
  image?: string;
  license_ccurl?: string;
  tags?: {
    genres?: string[];
    instruments?: string[];
    vartags?: string[];
  };
  lyrics?: string;
}

interface JamendoSearchApiResponse {
  headers: {
    status: string;
    code: number;
    error_message?: string;
    results_count: number;
  };
  results: JamendoTrackApiResponse[];
}

export class LicensedMusicProvider implements MusicProvider {
  readonly id: MusicProviderType = "licensed";
  readonly name: string = "Jamendo & CC Licensed Library";
  readonly isLicensedForVideo = true;


  private clientId: string;
  private baseUrl: string;

  constructor(config?: MusicProviderConfig) {
    this.clientId =
      config?.apiKey ||
      config?.clientId ||
      process.env.MUSIC_API_KEY ||
      process.env.JAMENDO_CLIENT_ID ||
      "";
    this.baseUrl = config?.baseUrl || "https://api.jamendo.com/v3.0";
  }

  async searchTracks(query: string, options?: SearchOptions): Promise<SearchResult> {
    const cacheKey = `licensed:search:${query}:${options?.limit || 20}:${options?.offset || 0}:${options?.genre || ""}:${options?.bpmMin || 0}`;
    const cached = musicCache.get<SearchResult>(cacheKey);
    if (cached) return cached;

    if (!this.clientId) {
      return {
        tracks: [],
        total: 0,
        hasMore: false,
        page: options?.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
        provider: "licensed",
      };
    }

    const searchUrl = new URL(`${this.baseUrl}/tracks/`);
    searchUrl.searchParams.set("client_id", this.clientId);
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("limit", String(options?.limit || 20));
    searchUrl.searchParams.set("offset", String(options?.offset || 0));
    searchUrl.searchParams.set("audioformat", "mp32");

    if (query) {
      searchUrl.searchParams.set("search", query);
    }
    if (options?.genre) {
      searchUrl.searchParams.set("tags", options.genre);
    } else if (options?.tags && options.tags.length > 0) {
      searchUrl.searchParams.set("tags", options.tags.join("+"));
    }
    if (options?.bpmMin) {
      searchUrl.searchParams.set("speed", `${options.bpmMin}_${options.bpmMax || 250}`);
    }

    try {
      const res = await fetch(searchUrl.toString());
      if (!res.ok) {
        throw new Error(`Jamendo API error: ${res.status} ${res.statusText}`);
      }
      const data: JamendoSearchApiResponse = await res.json();

      const tracks: NormalizedTrack[] = data.results.map((item) => this.mapJamendoTrack(item));
      const result: SearchResult = {
        tracks,
        total: data.headers.results_count,
        hasMore: data.results.length === (options?.limit || 20),
        page: options?.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
        provider: "licensed",
      };

      musicCache.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error("Licensed provider searchTracks error:", error);
      return {
        tracks: [],
        total: 0,
        hasMore: false,
        provider: "licensed",
      };
    }
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    const rawId = id.replace(/^(licensed|jamendo)-/, "");
    const cacheKey = `licensed:track:${rawId}`;
    const cached = musicCache.get<NormalizedTrack>(cacheKey);
    if (cached) return cached;

    if (!this.clientId) return null;

    const url = new URL(`${this.baseUrl}/tracks/`);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("format", "json");
    url.searchParams.set("id", rawId);
    url.searchParams.set("audioformat", "mp32");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data: JamendoSearchApiResponse = await res.json();
      if (!data.results || data.results.length === 0) return null;

      const track = this.mapJamendoTrack(data.results[0]);
      musicCache.set(cacheKey, track, 600);
      return track;
    } catch (error) {
      console.error(`Error retrieving licensed track ${id}:`, error);
      return null;
    }
  }

  async getArtist(id: string): Promise<Artist | null> {
    const track = await this.getTrack(id);
    if (!track) return null;

    return {
      id: `artist-${track.artist.toLowerCase().replace(/\s+/g, "-")}`,
      name: track.artist,
      genre: track.tags?.[0],
      avatarUrl: track.albumArt,
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const track = await this.getTrack(id);
    if (!track || !track.album) return null;

    return {
      id: `album-${track.album.toLowerCase().replace(/\s+/g, "-")}`,
      title: track.album,
      artist: track.artist,
      coverArtUrl: track.albumArt,
      albumArt: track.albumArt,
    };
  }

  async getPreview(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track?.previewUrl || null;
  }

  async getLyrics(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track?.lyrics || null;
  }

  async getAvailability(trackId: string): Promise<TrackAvailability> {
    const track = await this.getTrack(trackId);
    if (!track) {
      return {
        isAvailable: false,
        isAvailableForVideo: false,
        reason: "Track not found in catalog",
        previewAvailable: false,
      };
    }

    return {
      isAvailable: true,
      isAvailableForVideo: true,
      previewAvailable: Boolean(track.previewUrl),
    };
  }

  // Backwards compatibility methods
  async search(params: SearchTracksParams): Promise<SearchTracksResult> {
    return this.searchTracks(params.query || "", params);
  }

  async getTrackById(id: string): Promise<NormalizedTrack | null> {
    return this.getTrack(id);
  }

  async getStreamUrl(track: NormalizedTrack): Promise<string> {
    return track.previewUrl || track.audioUrl || "";
  }

  async getLicenseDetails(track: NormalizedTrack): Promise<LicenseInfo> {
    return track.licenseInfo || track.license;
  }

  private mapJamendoTrack(item: JamendoTrackApiResponse): NormalizedTrack {
    const tags: string[] = [];
    if (item.tags?.genres) tags.push(...item.tags.genres);
    if (item.tags?.instruments) tags.push(...item.tags.instruments);

    const license: LicenseInfo = {
      type: "Creative Commons / Jamendo License",
      url: item.license_ccurl || "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      attributionRequired: true,
      commercialAllowed: true,
      rawText: `Licensed via Jamendo API. Artist: ${item.artist_name}. CC Attribution required for social video.`,
      notice: "Cleared for TikTok, Reels, and Shorts creation.",
    };

    const imageUrl = item.image || item.album_image;

    return {
      id: `licensed-${item.id}`,
      provider: "licensed",
      externalId: item.id,
      title: item.name,
      artist: item.artist_name,
      artists: [item.artist_name],
      album: item.album_name,
      albumArt: imageUrl,
      coverArtUrl: imageUrl,
      duration: item.duration,
      previewUrl: item.audio,
      audioUrl: item.audio,
      tags,
      isAvailableForVideo: true,
      licenseInfo: license,
      license,
      lyrics: item.lyrics,
    };
  }
}
