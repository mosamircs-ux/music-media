import { spawn } from "child_process";
import type { FFmpegAudioOptions, FFmpegEncodeOptions, FFmpegProcessResult } from "./types";

/**
 * Builds FFmpeg audio filter string for fades and normalization.
 */
export function buildAudioFilterString(options: FFmpegAudioOptions): string {
  const filters: string[] = [];

  // Volume
  if (options.volume !== undefined && options.volume !== 1) {
    filters.push(`volume=${options.volume.toFixed(2)}`);
  }

  // Fade In
  if (options.fadeInDuration && options.fadeInDuration > 0) {
    filters.push(`afade=t=in:ss=0:d=${options.fadeInDuration.toFixed(2)}`);
  }

  // Fade Out
  if (options.fadeOutDuration && options.fadeOutDuration > 0 && options.duration) {
    const fadeOutStart = Math.max(0, options.duration - options.fadeOutDuration);
    filters.push(`afade=t=out:st=${fadeOutStart.toFixed(2)}:d=${options.fadeOutDuration.toFixed(2)}`);
  }

  // Audio Normalization
  if (options.normalize) {
    filters.push("loudnorm=I=-16:TP=-1.5:LRA=11");
  }

  return filters.join(",");
}

/**
 * Builds standard FFmpeg arguments for final 9:16 H.264/AAC/MP4 encoding.
 */
export function buildFFmpegArgs(
  videoInput: string,
  audioInput: string | null,
  outputPath: string,
  encodeOptions: FFmpegEncodeOptions = {},
  audioOptions: FFmpegAudioOptions = {}
): string[] {
  const {
    width = 1080,
    height = 1920,
    fps = 30,
    videoCodec = "libx264",
    audioCodec = "aac",
    crf = 23,
    preset = "medium",
    audioBitrate = "192k",
    faststart = true,
    threads = 0,
  } = encodeOptions;

  const args: string[] = ["-y"];

  // 1. Video Input
  args.push("-i", videoInput);

  // 2. Audio Input (if provided)
  if (audioInput) {
    if (audioOptions.startTime !== undefined && audioOptions.startTime > 0) {
      args.push("-ss", audioOptions.startTime.toString());
    }
    if (audioOptions.duration !== undefined && audioOptions.duration > 0) {
      args.push("-t", audioOptions.duration.toString());
    }
    args.push("-i", audioInput);
  }

  // 3. Video Filters (pad/scale to 9:16 target)
  const vf = `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,format=yuv420p`;
  args.push("-vf", vf);

  // 4. Video Codec & Quality
  args.push("-c:v", videoCodec);
  args.push("-preset", preset);
  args.push("-crf", crf.toString());
  args.push("-r", fps.toString());
  if (threads > 0) args.push("-threads", threads.toString());

  // 5. Audio Processing
  if (audioInput) {
    args.push("-c:a", audioCodec);
    args.push("-b:a", audioBitrate);
    const af = buildAudioFilterString(audioOptions);
    if (af) args.push("-af", af);
    args.push("-map", "0:v:0");
    args.push("-map", "1:a:0?");
    args.push("-shortest");
  } else {
    args.push("-an");
  }

  // 6. Faststart flag for web MP4 streaming
  if (faststart && outputPath.endsWith(".mp4")) {
    args.push("-movflags", "+faststart");
  }

  // 7. Output file
  args.push(outputPath);

  return args;
}

/**
 * Checks if FFmpeg binary is available on the current host.
 */
export function isFFmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("ffmpeg", ["-version"], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

/**
 * Executes FFmpeg command with progress tracking and fallback simulation.
 */
export async function executeFFmpeg(
  args: string[],
  onProgress?: (progressPercent: number) => void,
  forceSimulate?: boolean
): Promise<FFmpegProcessResult> {
  const command = `ffmpeg ${args.join(" ")}`;
  const shouldSimulate =
    forceSimulate ||
    process.env.SIMULATE_FFMPEG === "true" ||
    !(await isFFmpegAvailable());

  if (shouldSimulate) {
    // Development fallback simulation
    if (onProgress) {
      onProgress(30);
      await new Promise((r) => setTimeout(r, 50));
      onProgress(70);
      await new Promise((r) => setTimeout(r, 50));
      onProgress(100);
    }
    const outputPath = args[args.length - 1];
    return {
      success: true,
      outputPath,
      command,
      outputLog: "FFmpeg execution simulated (development mode)",
      durationSeconds: 15,
      fileSizeBytes: 1024 * 1024 * 5, // 5MB simulated
    };
  }

  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args);
    let outputLog = "";

    child.stderr.on("data", (data: Buffer) => {
      const text = data.toString();
      outputLog += text;

      // Parse time progression if available
      const timeMatch = text.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (timeMatch && onProgress) {
        const hours = parseFloat(timeMatch[1]);
        const mins = parseFloat(timeMatch[2]);
        const secs = parseFloat(timeMatch[3]);
        const currentSec = hours * 3600 + mins * 60 + secs;
        // Approximation if total duration not known
        const percent = Math.min(99, Math.round((currentSec / 15) * 100));
        onProgress(percent);
      }
    });

    child.on("error", (err) => {
      reject(new Error(`FFmpeg spawn error: ${err.message}`));
    });

    child.on("close", (code) => {
      const outputPath = args[args.length - 1];
      if (code === 0) {
        if (onProgress) onProgress(100);
        resolve({
          success: true,
          outputPath,
          command,
          outputLog,
        });
      } else {
        resolve({
          success: false,
          outputPath,
          command,
          outputLog,
          error: `FFmpeg exited with non-zero code ${code}`,
        });
      }
    });
  });
}