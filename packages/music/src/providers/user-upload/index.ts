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

export interface UserUploadedFilePayload {
  id: string;
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  audioUrl: string;
  coverArtUrl?: string;
  fileSize?: number;
  mimeType?: string;
}

export class UserUploadMusicProvider implements MusicProvider {
  readonly id: MusicProviderType = "user-upload";
  readonly name: string = "User Uploaded Audio";
  readonly isLicensedForVideo = true;


  private customTracks: Map<string, NormalizedTrack> = new Map();

  constructor(_config?: MusicProviderConfig) {}

  /**
   * Registers a user uploaded audio file into the session store
   */
  createTrackFromUpload(payload: UserUploadedFilePayload): NormalizedTrack {
    const artistName = payload.artist || "Original Creator";
    const license: LicenseInfo = {
      type: "User Own Audio Rights",
      attributionRequired: false,
      commercialAllowed: true,
      rawText: `User-uploaded audio track. User warrants they own or hold necessary rights to use this audio.`,
      notice: "Cleared for video creation by user declaration.",
    };

    const track: NormalizedTrack = {
      id: payload.id.startsWith("upload-") ? payload.id : `upload-${payload.id}`,
      provider: "user-upload",
      externalId: payload.id,
      title: payload.title,
      artist: artistName,
      artists: [artistName],
      album: payload.album || "User Uploads",
      albumArt: payload.coverArtUrl,
      coverArtUrl: payload.coverArtUrl,
      duration: payload.duration,
      previewUrl: payload.audioUrl,
      audioUrl: payload.audioUrl,
      isAvailableForVideo: true,
      licenseInfo: license,
      license,
    };

    this.customTracks.set(track.id, track);
    musicCache.set(`upload:track:${track.id}`, track, 3600);
    return track;
  }

  async searchTracks(query: string, options?: SearchOptions): Promise<SearchResult> {
    const allTracks = Array.from(this.customTracks.values());
    const filtered = query
      ? allTracks.filter(
          (t) =>
            t.title.toLowerCase().includes(query.toLowerCase()) ||
            t.artist.toLowerCase().includes(query.toLowerCase())
        )
      : allTracks;

    const offset = options?.offset || 0;
    const limit = options?.limit || 20;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      tracks: paginated,
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
      page: Math.floor(offset / limit) + 1,
      provider: "user-upload",
    };
  }

  async getTrack(id: string): Promise<NormalizedTrack | null> {
    return this.customTracks.get(id) || musicCache.get<NormalizedTrack>(`upload:track:${id}`) || null;
  }

  async getArtist(id: string): Promise<Artist | null> {
    const track = await this.getTrack(id);
    if (!track) return null;

    return {
      id: `artist-${track.artist.toLowerCase().replace(/\s+/g, "-")}`,
      name: track.artist,
      avatarUrl: track.albumArt,
    };
  }

  async getAlbum(id: string): Promise<Album | null> {
    const track = await this.getTrack(id);
    if (!track) return null;

    return {
      id: `album-${(track.album || "user-uploads").toLowerCase().replace(/\s+/g, "-")}`,
      title: track.album || "User Uploads",
      artist: track.artist,
    };
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
    return {
      isAvailable: Boolean(track),
      isAvailableForVideo: true,
      previewAvailable: Boolean(track?.previewUrl),
    };
  }
}
