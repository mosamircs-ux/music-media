import type { TransitionType } from "@musicmotion/shared";

export interface TransitionConfig {
  type: TransitionType;
  durationFrames: number;
}

export interface TransitionStyles {
  opacity: number;
  transform: string;
  filter?: string;
}