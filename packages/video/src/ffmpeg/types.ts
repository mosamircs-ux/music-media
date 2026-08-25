export interface FFmpegAudioOptions {
  startTime?: number;
  duration?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  volume?: number;
  normalize?: boolean;
}

export interface FFmpegEncodeOptions {
  width?: number;
  height?: number;
  fps?: number;
  videoCodec?: "libx264" | "libx265" | "copy";
  audioCodec?: "aac" | "mp3" | "copy";
  crf?: number; // default 23 (visually lossless)
  preset?: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow";
  audioBitrate?: string; // default "192k"
  faststart?: boolean; // default true for web MP4 streaming
  threads?: number;
}

export interface FFmpegProcessResult {
  success: boolean;
  outputPath: string;
  command: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  outputLog?: string;
  error?: string;
}