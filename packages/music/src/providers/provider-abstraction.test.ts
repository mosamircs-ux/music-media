import { describe, it, expect } from "vitest";
import { MusicProviderRegistry, musicProviders } from "./registry";
import { LicensedMusicProvider } from "./licensed";
import { SpotifyMusicProvider } from "./spotify";
import { AppleMusicProvider } from "./apple";
import { UserUploadMusicProvider } from "./user-upload";

describe("Music Provider Architecture & Abstraction", () => {
  it("initializes singleton registry with core providers", () => {
    const registry = MusicProviderRegistry.getInstance();
    expect(registry).toBe(musicProviders);

    const licensed = registry.getProvider("licensed");
    expect(licensed).toBeInstanceOf(LicensedMusicProvider);
    expect(licensed.id).toBe("licensed");
    expect(licensed.isLicensedForVideo).toBe(true);

    const spotify = registry.getProvider("spotify");
    expect(spotify).toBeInstanceOf(SpotifyMusicProvider);
    expect(spotify.id).toBe("spotify");
    expect(spotify.isLicensedForVideo).toBe(false);

    const apple = registry.getProvider("apple");
    expect(apple).toBeInstanceOf(AppleMusicProvider);
    expect(apple.id).toBe("apple");
    expect(apple.isLicensedForVideo).toBe(false);

    const upload = registry.getProvider("user-upload");
    expect(upload).toBeInstanceOf(UserUploadMusicProvider);
    expect(upload.id).toBe("user-upload");
    expect(upload.isLicensedForVideo).toBe(true);
  });

  it("allows switching default provider dynamically", () => {
    const registry = MusicProviderRegistry.getInstance();
    expect(registry.getDefaultProviderId()).toBe("licensed");

    registry.setDefaultProviderId("apple");
    expect(registry.getDefaultProviderId()).toBe("apple");
    expect(registry.getProvider().id).toBe("apple");

    // Reset back to licensed
    registry.setDefaultProviderId("licensed");
    expect(registry.getDefaultProviderId()).toBe("licensed");
  });

  it("lists all registered distinct providers", () => {
    const providers = musicProviders.getAllProviders();
    expect(providers.length).toBeGreaterThanOrEqual(4);
    const ids = providers.map((p) => p.id);
    expect(ids).toContain("licensed");
    expect(ids).toContain("spotify");
    expect(ids).toContain("apple");
    expect(ids).toContain("user-upload");
  });
});
