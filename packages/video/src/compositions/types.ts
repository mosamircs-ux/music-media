import type { Caption, Scene, TrackSelection, VideoConfig } from "@musicmotion/shared";

export interface MusicMotionVideoProps {
  videoConfig: VideoConfig;
  trackSelection: TrackSelection;
  audioUrl: string;
  scenes: Scene[];
  captions: Caption[];
  watermarkText?: string;
}
