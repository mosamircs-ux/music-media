import { describe, it, expect } from "vitest";
import {
  LicensedLyricsCaptionProvider,
  SpeechToTextCaptionProvider,
  CreativeAICaptionProvider,
  AutoCaptionRegistry,
  autoCaptions,
} from "./providers";
import type { NormalizedTrack } from "@musicmotion/shared";

describe("Auto-Caption Provider Abstraction & Generation", () => {
  const mockTrack: NormalizedTrack = {
    id: "licensed-1",
    provider: "licensed",
    externalId: "1",
    title: "Synthwave Sunset",
    artist: "Retro Wave",
    artists: ["Retro Wave"],
    duration: 180,
    isAvailableForVideo: true,
    licenseInfo: {
      type: "Creative Commons BY 4.0",
      attributionRequired: true,
      commercialAllowed: true,
    },
    license: {
      type: "Creative Commons BY 4.0",
      attributionRequired: true,
      commercialAllowed: true,
    },
    lyrics: "Driving down the neon highway\nLights are blurring through the rain\nNever looking back again",
  };

  it("licensed lyrics provider converts multi-line lyrics to timed captions", async () => {
    const provider = new LicensedLyricsCaptionProvider();
    const result = await provider.generateCaptions(mockTrack, { duration: 15 });

    expect(result.captions.length).toBe(3);
    expect(result.captions[0].text).toBe("Driving down the neon highway");
    expect(result.captions[0].startTime).toBe(0);
    expect(result.captions[0].endTime).toBe(5);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("speech-to-text provider generates aligned captions for video segment", async () => {
    const provider = new SpeechToTextCaptionProvider();
    const result = await provider.generateCaptions(mockTrack, { duration: 20, style: "Karaoke" });

    expect(result.captions.length).toBeGreaterThan(0);
    expect(result.captions[0].animation).toBe("Word-by-word");
    expect(result.captions[0].style).toBe("Karaoke");
  });

  it("creative AI provider generates Arabic RTL captions when language is ar", async () => {
    const provider = new CreativeAICaptionProvider();
    const result = await provider.generateCaptions(mockTrack, {
      duration: 15,
      language: "ar",
      style: "Neon",
    });

    expect(result.language).toBe("ar");
    expect(result.captions.length).toBeGreaterThan(0);
    expect(result.captions[0].isRTL).toBe(true);
  });

  it("auto-caption registry resolves provider and falls back gracefully", async () => {
    const registry = AutoCaptionRegistry.getInstance();
    const lyricsRes = await registry.generateCaptionsWithFallback(mockTrack, { duration: 15 });
    expect(lyricsRes.captions.length).toBe(3);

    const trackWithoutLyrics: NormalizedTrack = { ...mockTrack, lyrics: undefined };
    const fallbackRes = await registry.generateCaptionsWithFallback(trackWithoutLyrics, { duration: 15 });
    expect(fallbackRes.captions.length).toBeGreaterThan(0);
    expect(fallbackRes.provider).toBe("creative-ai");
  });

  it("singleton instance is accessible", () => {
    expect(autoCaptions).toBeDefined();
    expect(autoCaptions.getProvider("licensed-lyrics")).toBeDefined();
  });
});
