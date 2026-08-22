import type { IMusicProvider, MusicProviderConfig } from "./types";
import type {
  Track,
  SearchTracksParams,
  SearchTracksResult,
  LicenseInfo,
} from "@musicmotion/shared";

interface JamendoTrackApiResponse {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  album_name?: string;
  audio: string;
  image?: string;
  license_ccurl?: string;
  tags?: {
    genres?: string[];
    instruments?: string[];
    vartags?: string[];
  };
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

export class JamendoMusicProvider implements IMusicProvider {
  readonly id = "jamendo" as const;
  readonly name = "Jamendo Licensing API";
  readonly isLicensed = true;

  private clientId: string;
  private baseUrl: string;

  constructor(config?: MusicProviderConfig) {
    this.clientId = config?.clientId || process.env.JAMENDO_CLIENT_ID || "";
    this.baseUrl = config?.baseUrl || "https://api.jamendo.com/v3.0";
  }

  async search(params: SearchTracksParams): Promise<SearchTracksResult> {
    if (!this.clientId) {
      // In dev mode without a client ID, return safe fallback metadata
      return {
        tracks: [],
        total: 0,
        hasMore: false,
      };
    }

    const searchUrl = new URL(`${this.baseUrl}/tracks/`);
    searchUrl.searchParams.set("client_id", this.clientId);
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("limit", String(params.limit || 20));
    searchUrl.searchParams.set("offset", String(params.offset || 0));
    searchUrl.searchParams.set("audioformat", "mp32");

    if (params.query) {
      searchUrl.searchParams.set("search", params.query);
    }
    if (params.tags && params.tags.length > 0) {
      searchUrl.searchParams.set("tags", params.tags.join("+"));
    }
    if (params.bpmMin) {
      searchUrl.searchParams.set("speed", `${params.bpmMin}_${params.bpmMax || 250}`);
    }

    try {
      const res = await fetch(searchUrl.toString());
      if (!res.ok) {
        throw new Error(`Jamendo API error: ${res.status} ${res.statusText}`);
      }
      const data: JamendoSearchApiResponse = await res.json();

      const tracks: Track[] = data.results.map((item) => this.mapJamendoTrack(item));

      return {
        tracks,
        total: data.headers.results_count,
        hasMore: data.results.length === (params.limit || 20),
      };
    } catch (error) {
      console.error("Error fetching tracks from Jamendo:", error);
      return {
        tracks: [],
        total: 0,
        hasMore: false,
      };
    }
  }

  async getTrackById(id: string): Promise<Track | null> {
    if (!this.clientId) return null;

    const url = new URL(`${this.baseUrl}/tracks/`);
    url.searchParams.set("client_id", this.clientId);
    url.searchParams.set("format", "json");
    url.searchParams.set("id", id);
    url.searchParams.set("audioformat", "mp32");

    try {
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const data: JamendoSearchApiResponse = await res.json();
      if (!data.results || data.results.length === 0) return null;

      return this.mapJamendoTrack(data.results[0]);
    } catch (error) {
      console.error(`Error retrieving track ${id} from Jamendo:`, error);
      return null;
    }
  }

  async getStreamUrl(track: Track): Promise<string> {
    return track.audioUrl;
  }

  async getLicenseDetails(track: Track): Promise<LicenseInfo> {
    return track.license;
  }

  private mapJamendoTrack(item: JamendoTrackApiResponse): Track {
    const tags: string[] = [];
    if (item.tags?.genres) tags.push(...item.tags.genres);
    if (item.tags?.instruments) tags.push(...item.tags.instruments);

    return {
      id: `jamendo-${item.id}`,
      provider: "jamendo",
      externalId: item.id,
      title: item.name,
      artist: item.artist_name,
      album: item.album_name,
      duration: item.duration,
      audioUrl: item.audio,
      coverArtUrl: item.image,
      tags,
      license: {
        type: "Creative Commons / Jamendo License",
        url: item.license_ccurl || "https://creativecommons.org/licenses/by-nc-nd/4.0/",
        attributionRequired: true,
        commercialAllowed: false,
        rawText: `Track provided by Jamendo. Artist: ${item.artist_name}. License: ${item.license_ccurl || "CC"}`,
      },
    };
  }
}
