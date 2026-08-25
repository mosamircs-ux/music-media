import { describe, it, expect } from "vitest";
import { RateLimiter, musicRateLimiter } from "./rateLimiter";
import { LicensedMusicProvider } from "./licensed";
import { SpotifyMusicProvider } from "./spotify";

describe("Error Handling, Rate Limiting & Unavailable Tracks", () => {
  it("rate limiter respects window quotas and tracks requests", () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    const key = "test-provider";

    expect(limiter.isAllowed(key)).toBe(true);
    expect(limiter.isAllowed(key)).toBe(true);
    expect(limiter.isAllowed(key)).toBe(true);
    expect(limiter.isAllowed(key)).toBe(false); // Exceeded 3 requests

    expect(limiter.getRemaining(key)).toBe(0);
    limiter.reset(key);
    expect(limiter.isAllowed(key)).toBe(true);
  });

  it("global musicRateLimiter is operational", () => {
    expect(musicRateLimiter.isAllowed("licensed")).toBe(true);
    expect(musicRateLimiter.getRemaining("licensed")).toBeGreaterThan(0);
  });

  it("licensed provider returns empty result without throwing when credentials missing", async () => {
    const provider = new LicensedMusicProvider({ apiKey: "" });
    const res = await provider.searchTracks("synthwave");
    expect(res.tracks).toEqual([]);
    expect(res.total).toBe(0);
    expect(res.hasMore).toBe(false);
  });

  it("spotify provider safely handles missing credentials without crashing", async () => {
    const provider = new SpotifyMusicProvider({ clientId: "", clientSecret: "" });
    const res = await provider.searchTracks("jazz");
    expect(res.tracks).toEqual([]);
    expect(res.total).toBe(0);

    const track = await provider.getTrack("spotify-nonexistent");
    expect(track).toBeNull();

    const artist = await provider.getArtist("spotify-nonexistent");
    expect(artist).toBeNull();

    const album = await provider.getAlbum("spotify-nonexistent");
    expect(album).toBeNull();
  });

  it("checks unavailable tracks gracefully across providers", async () => {
    const licensed = new LicensedMusicProvider();
    const status = await licensed.getAvailability("licensed-nonexistent");
    expect(status.isAvailable).toBe(false);
    expect(status.isAvailableForVideo).toBe(false);
  });
});
