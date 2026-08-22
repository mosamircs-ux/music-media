export interface WaveformRegion {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  color?: string;
  drag?: boolean;
  resize?: boolean;
}

export interface WaveformConfig {
  container: string | HTMLElement;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  cursorWidth?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  height?: number;
  normalize?: boolean;
  minPxPerSec?: number;
}

export interface WaveformPlayerEvents {
  onReady?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onRegionChange?: (region: WaveformRegion) => void;
  onError?: (error: Error) => void;
}
