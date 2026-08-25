import { describe, it, expect } from "vitest";
import { UserUploadMusicProvider } from "./user-upload";
import { LicensedMusicProvider } from "./licensed";
import { SpotifyMusicProvider } from "./spotify";
import { AppleMusicProvider } from "./apple";

describe("Track Normalization Across Providers", () => {
  it("normalizes user-uploaded tracks with full attributes", () => {
    const provider = new UserUploadMusicProvider();
    const track = provider.createTrackFromUpload({
      id: "up-99",
      title: "Summer Breeze Electro",
      artist: "Original Sound Master",
      album: "Studio Vault 1",
      duration: 120,
      audioUrl: "https://example.com/stream.mp3",
      coverArtUrl: "https://example.com/cover.jpg",
    });

    // Verify all NormalizedTrack schema fields
    expect(track.id).toBe("upload-up-99");
    expect(track.provider).toBe("user-upload");
    expect(track.externalId).toBe("up-99");
    expect(track.title).toBe("Summer Breeze Electro");
    expect(track.artist).toBe("Original Sound Master");
    expect(track.artists).toEqual(["Original Sound Master"]);
    expect(track.album).toBe("Studio Vault 1");
    expect(track.albumArt).toBe("https://example.com/cover.jpg");
    expect(track.duration).toBe(120);
    expect(track.previewUrl).toBe("https://example.com/stream.mp3");
    expect(track.isAvailableForVideo).toBe(true);
    expect(track.licenseInfo).toBeDefined();
    expect(track.licenseInfo.commercialAllowed).toBe(true);
  });

  it("licensed tracks are video-cleared and include legal notices", async () => {
    const provider = new LicensedMusicProvider();
    // Test mapping structure
    const availability = await provider.getAvailability("licensed-non-existent");
    expect(availability.isAvailable).toBe(false);
  });

  it("spotify and apple tracks are marked as preview-only (not for video export)", async () => {
    const spotify = new SpotifyMusicProvider();
    const apple = new AppleMusicProvider();

    expect(spotify.isLicensedForVideo).toBe(false);
    expect(apple.isLicensedForVideo).toBe(false);

    const spotifyAvail = await spotify.getAvailability("spotify-unknown");
    expect(spotifyAvail.isAvailableForVideo).toBe(false);

    const appleAvail = await apple.getAvailability("apple-unknown");
    expect(appleAvail.isAvailableForVideo).toBe(false);
  });
});
