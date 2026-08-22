import type {
  Track,
  SearchTracksParams,
  SearchTracksResult,
  LicenseInfo,
  MusicProviderType,
} from "@musicmotion/shared";

export interface MusicProviderConfig {
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
}

export interface IMusicProvider {
  readonly id: MusicProviderType;
  readonly name: string;
  readonly isLicensed: boolean;

  search(params: SearchTracksParams): Promise<SearchTracksResult>;
  getTrackById(id: string): Promise<Track | null>;
  getStreamUrl(track: Track): Promise<string>;
  getLicenseDetails(track: Track): Promise<LicenseInfo>;
}
