import { describe, it, expect } from "vitest";
import { JamendoMusicProvider } from "./jamendo";
import { UploadMusicProvider } from "./upload";
import { MusicProviderRegistry } from "./registry";

describe("Music Provider Abstraction", () => {
  it("registry retrieves registered providers", () => {
    const registry = MusicProviderRegistry.getInstance();
    const jamendo = registry.getProvider("jamendo");
    expect(jamendo).toBeDefined();
    expect(jamendo.id).toBe("jamendo");
    expect(jamendo.isLicensed).toBe(true);

    const upload = registry.getProvider("upload");
    expect(upload).toBeDefined();
    expect(upload.id).toBe("upload");
  });

  it("handles search gracefully when client id is missing", async () => {
    const provider = new JamendoMusicProvider({ clientId: "" });
    const result = await provider.search({ query: "ambient" });
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

    expect(track.id).toBe("up-1");
    expect(track.provider).toBe("upload");
    expect(track.license.commercialAllowed).toBe(true);
  });
});
