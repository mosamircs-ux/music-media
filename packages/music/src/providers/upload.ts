import type { IMusicProvider } from "./types";
import type {
  Track,
  SearchTracksParams,
  SearchTracksResult,
  LicenseInfo,
} from "@musicmotion/shared";

export interface UploadedTrackMeta {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  waveformUrl?: string;
  fileSize: number;
  mimeType: string;
}

export class UploadMusicProvider implements IMusicProvider {
  readonly id = "upload" as const;
  readonly name = "User Uploaded Audio";
  readonly isLicensed = false;

  async search(_params: SearchTracksParams): Promise<SearchTracksResult> {
    return {
      tracks: [],
      total: 0,
      hasMore: false,
    };
  }

  async getTrackById(_id: string): Promise<Track | null> {
    return null;
  }

  async getStreamUrl(track: Track): Promise<string> {
    return track.audioUrl;
  }

  async getLicenseDetails(_track: Track): Promise<LicenseInfo> {
    return {
      type: "User Owned / Original",
      attributionRequired: false,
      commercialAllowed: true,
      rawText: "Audio track uploaded by user. The user warrants they possess all necessary broadcast & distribution rights.",
    };
  }

  createTrackFromUpload(meta: UploadedTrackMeta): Track {
    return {
      id: meta.id,
      provider: "upload",
      externalId: meta.id,
      title: meta.title,
      artist: meta.artist || "Original Audio",
      duration: meta.duration,
      audioUrl: meta.audioUrl,
      waveformUrl: meta.waveformUrl,
      license: {
        type: "User Owned / Original",
        attributionRequired: false,
        commercialAllowed: true,
        rawText: "User certified original / licensed audio.",
      },
    };
  }
}
