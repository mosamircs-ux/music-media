import { describe, it, expect } from "vitest";
import {
  buildAudioFilterString,
  buildFFmpegArgs,
  executeFFmpeg,
} from "../ffmpeg/processor";

describe("FFmpeg Command Processor", () => {
  it("builds audio filter strings for volume, fades, and normalization", () => {
    const filter = buildAudioFilterString({
      volume: 0.8,
      fadeInDuration: 1.5,
      fadeOutDuration: 2.0,
      duration: 15,
      normalize: true,
    });

    expect(filter).toContain("volume=0.80");
    expect(filter).toContain("afade=t=in:ss=0:d=1.50");
    expect(filter).toContain("afade=t=out:st=13.00:d=2.00");
    expect(filter).toContain("loudnorm=");
  });

  it("builds correct 9:16 H.264, AAC, and Faststart MP4 encoding arguments", () => {
    const args = buildFFmpegArgs(
      "video.raw",
      "audio.wav",
      "output.mp4",
      {
        width: 1080,
        height: 1920,
        fps: 30,
        crf: 22,
        videoCodec: "libx264",
        audioCodec: "aac",
        faststart: true,
      },
      {
        startTime: 5,
        duration: 15,
        fadeInDuration: 1.0,
      }
    );

    expect(args).toContain("-i");
    expect(args).toContain("video.raw");
    expect(args).toContain("audio.wav");
    expect(args).toContain("-c:v");
    expect(args).toContain("libx264");
    expect(args).toContain("-c:a");
    expect(args).toContain("aac");
    expect(args).toContain("-movflags");
    expect(args).toContain("+faststart");
    expect(args).toContain("-crf");
    expect(args).toContain("22");
    expect(args).toContain("output.mp4");
  });

  it("executeFFmpeg completes successfully in simulation mode", async () => {
    let progressUpdates = 0;
    const result = await executeFFmpeg(
      ["-i", "test.mp4", "out.mp4"],
      (_p) => {
        progressUpdates++;
      },
      true
    );

    expect(result.success).toBe(true);
    expect(result.outputPath).toBe("out.mp4");
    expect(progressUpdates).toBeGreaterThanOrEqual(1);
  });
});