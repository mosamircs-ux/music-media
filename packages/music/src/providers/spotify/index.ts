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

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyTrackObject {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height?: number; width?: number }>;
    release_date?: string;
  };
  external_urls?: {
    spotify?: string;
  };
}

interface SpotifySearchResponse {
  tracks?: {
    items: SpotifyTrackObject[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  };
}

interface SpotifyArtistObject {
  id: string;
  name: string;
  genres?: string[];
  images?: Array<{ url: string }>;
  followers?: { total: number };
  external_urls?: { spotify?: string };
}

interface SpotifyAlbumObject {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  images: Array<{ url: string }>;
  release_date?: string;
  total_tracks?: number;
  external_urls?: { spotify?: string };
}

export class SpotifyMusicProvider implements MusicProvider {
  readonly id: MusicProviderType = "spotify";
  readonly name: string = "Spotify Discovery API";
  readonly isLicensedForVideo = false; // Discovery & Metadata only


  private clientId: string;
  private clientSecret: string;
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(config?: MusicProviderConfig) {
    this.clientId =
      config?.clientId ||
      config?.apiKey ||
      process.env.SPOTIFY_CLIENT_ID ||
      process.env.MUSIC_API_KEY ||
      "";
    this.clientSecret =
      config?.clientSecret ||
      config?.apiSecret ||
      process.env.SPOTIFY_CLIENT_SECRET ||
      process.env.MUSIC_API_SECRET ||
      "";
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    if (this.token && Date.now() < this.tokenExpiresAt - 60000) {
      return this.token;
    }

    const cachedToken = musicCache.get<string>("spotify:access_token");
    if (cachedToken) {
      this.token = cachedToken;
      return cachedToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        console.error(`Spotify auth error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data: SpotifyTokenResponse = await response.json();
      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + data.expires_in * 1000;
      musicCache.set("spotify:access_token", data.access_token, data.expires_in - 60);

      return data.access_token;
    } catch (error) {
      console.error("Failed to authenticate with Spotify API:", error);
      return null;
    }
  }

  async searchTracks(query: string, options?: SearchOptions): Promise<SearchResult> {
    const cacheKey = `spotify:search:${query}:${options?.limit || 20}:${options?.offset || 0}`;
    const cached = musicCache.get<SearchResult>(cacheKey);
    if (cached) return cached;

    const token = await this.getAccessToken();
    if (!token) {
      return {
        tracks: [],
        total: 0,
        hasMore: false,
        page: options?.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
        provider: "spotify",
      };
    }

    const searchUrl = new URL("https://api.spotify.com/v1/search");
    searchUrl.searchParams.set("q", query || "top tracks");
    searchUrl.searchParams.set("type", "track");
    searchUrl.searchParams.set("limit", String(options?.limit || 20));
    searchUrl.searchParams.set("offset", String(options?.offset || 0));

    try {
      const res = await fetch(searchUrl.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Spotify Search failed: ${res.status} ${res.statusText}`);
      }

      const data: SpotifySearchResponse = await res.json();
      const items = data.tracks?.items || [];
      const tracks: NormalizedTrack[] = items.map((item) => this.mapSpotifyTrack(item));

      const result: SearchResult = {
        tracks,
        total: data.tracks?.total || 0,
        hasMore: Boolean(data.tracks?.next),
        page: options?.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
        provider: "spotify",
      };

      musicCache.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      console.error("Spotify searchTracks error:", error);
      return {
        tracks: [],
        total: 0,
        hasMore: false,
        provider: "spotify",
      };
    }
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    const rawId = id.replace(/^spotify-/, "");
    const cacheKey = `spotify:track:${rawId}`;
    const cached = musicCache.get<NormalizedTrack>(cacheKey);
    if (cached) return cached;

    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const res = await fetch(`https://api.spotify.com/v1/tracks/${rawId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;
      const data: SpotifyTrackObject = await res.json();
      const track = this.mapSpotifyTrack(data);

      musicCache.set(cacheKey, track, 600);
      return track;
    } catch (error) {
      console.error(`Error retrieving Spotify track ${id}:`, error);
      return null;
    }
  }

  async getArtist(id: string): Promise<Artist | null> {
    const rawId = id.replace(/^spotify-artist-/, "");
    const cacheKey = `spotify:artist:${rawId}`;
    const cached = musicCache.get<Artist>(cacheKey);
    if (cached) return cached;

    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const res = await fetch(`https://api.spotify.com/v1/artists/${rawId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;
      const data: SpotifyArtistObject = await res.json();
      const artist: Artist = {
        id: `spotify-artist-${data.id}`,
        name: data.name,
        genre: data.genres?.[0],
        avatarUrl: data.images?.[0]?.url,
        monthlyListeners: data.followers?.total ? `${(data.followers.total / 1000).toFixed(0)}K` : undefined,
        externalUrl: data.external_urls?.spotify,
      };

      musicCache.set(cacheKey, artist, 1800);
      return artist;
    } catch (error) {
      console.error(`Error retrieving Spotify artist ${id}:`, error);
      return null;
    }
  }

  async getAlbum(id: string): Promise<Album | null> {
    const rawId = id.replace(/^spotify-album-/, "");
    const cacheKey = `spotify:album:${rawId}`;
    const cached = musicCache.get<Album>(cacheKey);
    if (cached) return cached;

    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const res = await fetch(`https://api.spotify.com/v1/albums/${rawId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return null;
      const data: SpotifyAlbumObject = await res.json();
      const album: Album = {
        id: `spotify-album-${data.id}`,
        title: data.name,
        artist: data.artists?.[0]?.name || "Various Artists",
        artists: data.artists?.map((a) => a.name) || [],
        coverArtUrl: data.images?.[0]?.url,
        albumArt: data.images?.[0]?.url,
        releaseYear: data.release_date ? parseInt(data.release_date.slice(0, 4), 10) : undefined,
        totalTracks: data.total_tracks,
        externalUrl: data.external_urls?.spotify,
      };

      musicCache.set(cacheKey, album, 1800);
      return album;
    } catch (error) {
      console.error(`Error retrieving Spotify album ${id}:`, error);
      return null;
    }
  }

  async getPreview(trackId: string): Promise<string | null> {
    const track = await this.getTrack(trackId);
    return track?.previewUrl || null;
  }

  async getLyrics(_trackId: string): Promise<string | null> {
    // Spotify API does not provide a public lyrics endpoint without special partner licensing
    return null;
  }

  async getAvailability(trackId: string): Promise<TrackAvailability> {
    const track = await this.getTrack(trackId);
    if (!track) {
      return {
        isAvailable: false,
        isAvailableForVideo: false,
        reason: "Track not found on Spotify",
        previewAvailable: false,
      };
    }

    return {
      isAvailable: true,
      isAvailableForVideo: false, // Spotify API tracks are discovery/preview only
      reason: "Spotify catalog is for discovery & metadata preview only. Use CC/Licensed tracks for video export.",
      previewAvailable: Boolean(track.previewUrl),
    };
  }

  private mapSpotifyTrack(item: SpotifyTrackObject): NormalizedTrack {
    const primaryArtist = item.artists?.[0]?.name || "Unknown Artist";
    const allArtists = item.artists?.map((a) => a.name) || [primaryArtist];
    const image = item.album?.images?.[0]?.url;
    const durationSeconds = Math.round(item.duration_ms / 1000);

    const license: LicenseInfo = {
      type: "Spotify Discovery License",
      url: item.external_urls?.spotify,
      attributionRequired: true,
      commercialAllowed: false,
      rawText: `Track metadata provided by Spotify Web API. Copyright belongs to respective owners.`,
      notice: "Discovery & preview only. Not licensed for video export synchronization.",
    };

    return {
      id: `spotify-${item.id}`,
      provider: "spotify",
      externalId: item.id,
      title: item.name,
      artist: primaryArtist,
      artists: allArtists,
      album: item.album?.name,
      albumArt: image,
      coverArtUrl: image,
      duration: durationSeconds,
      previewUrl: item.preview_url || undefined,
      audioUrl: item.preview_url || undefined,
      isAvailableForVideo: false,
      licenseInfo: license,
      license,
    };
  }
}
