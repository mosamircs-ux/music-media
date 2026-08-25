import { describe, it, expect } from "vitest";
import { JamendoMusicProvider } from "./jamendo";
import { UploadMusicProvider } from "./upload";
import { MusicProviderRegistry } from "./registry";

describe("Music Provider Abstraction (Legacy Aliases)", () => {
  it("registry retrieves registered providers via aliases", () => {
    const registry = MusicProviderRegistry.getInstance();
    const jamendo = registry.getProvider("jamendo");
    expect(jamendo).toBeDefined();
    expect(jamendo.isLicensedForVideo).toBe(true);

    const upload = registry.getProvider("upload");
    expect(upload).toBeDefined();
    expect(upload.isLicensedForVideo).toBe(true);
  });

  it("handles search gracefully when client id is missing", async () => {
    const provider = new JamendoMusicProvider({ clientId: "" });
    const result = await provider.searchTracks("ambient");
    expect(result.tracks).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("upload provider creates track metadata accurately", () => {
    const provider = new UploadMusicProvider();
    const track = provider.createTrackFromUpload({
      id: "up-1",
      title: "My Custom Beat",
      artist: "Original Creator",
      duration: 30,
      audioUrl: "https://example.com/audio.mp3",
      fileSize: 1024000,
      mimeType: "audio/mp3",
    });

    expect(track.id).toBe("upload-up-1");
    expect(track.isAvailableForVideo).toBe(true);
    expect(track.licenseInfo.commercialAllowed).toBe(true);
  });
});
