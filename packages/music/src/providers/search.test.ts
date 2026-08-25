import { describe, it, expect } from "vitest";
import { UserUploadMusicProvider } from "./user-upload";
import { musicProviders } from "./registry";
import { musicCache } from "./cache";

describe("Music Search & Pagination", () => {
  it("searches user-uploaded catalog with query filtering and pagination", async () => {
    const upload = new UserUploadMusicProvider();

    upload.createTrackFromUpload({
      id: "track-a",
      title: "Chillout Sunset",
      artist: "DJ Relax",
      duration: 180,
      audioUrl: "https://example.com/a.mp3",
    });

    upload.createTrackFromUpload({
      id: "track-b",
      title: "Energetic Club Beat",
      artist: "DJ Energy",
      duration: 140,
      audioUrl: "https://example.com/b.mp3",
    });

    upload.createTrackFromUpload({
      id: "track-c",
      title: "Chillout Midnight",
      artist: "DJ Relax",
      duration: 160,
      audioUrl: "https://example.com/c.mp3",
    });

    // Query filter
    const searchRes = await upload.searchTracks("Chillout");
    expect(searchRes.tracks.length).toBe(2);
    expect(searchRes.total).toBe(2);

    // Pagination
    const page1 = await upload.searchTracks("", { limit: 2, offset: 0 });
    expect(page1.tracks.length).toBe(2);
    expect(page1.hasMore).toBe(true);

    const page2 = await upload.searchTracks("", { limit: 2, offset: 2 });
    expect(page2.tracks.length).toBe(1);
    expect(page2.hasMore).toBe(false);
  });

  it("caches search results with TTL", () => {
    musicCache.clear();
    const key = "test:cache:key";
    musicCache.set(key, { tracks: [], total: 0 });

    expect(musicCache.has(key)).toBe(true);
    expect(musicCache.get(key)).toEqual({ tracks: [], total: 0 });

    musicCache.delete(key);
    expect(musicCache.has(key)).toBe(false);
  });

  it("searchWithFallback returns normalized result structure", async () => {
    const res = await musicProviders.searchWithFallback("cyberpunk", { limit: 5 });
    expect(res).toBeDefined();
    expect(Array.isArray(res.tracks)).toBe(true);
    expect(typeof res.total).toBe("number");
    expect(typeof res.hasMore).toBe("boolean");
  });
});
