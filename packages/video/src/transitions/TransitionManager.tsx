"use client";

import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { TransitionType } from "@musicmotion/shared";
import type { TransitionStyles } from "./types";

export interface TransitionWrapperProps {
  children: React.ReactNode;
  type?: TransitionType;
  durationInFrames: number;
  transitionDurationFrames?: number;
}

/**
 * Calculates transition styles (opacity, transform, filter) based on current frame.
 */
export function getTransitionStyles(
  frame: number,
  totalFrames: number,
  type: TransitionType = "fade",
  transFrames = 15,
  _fps = 30
): TransitionStyles {
  // Safe bounds
  const effectiveTrans = Math.min(transFrames, Math.floor(totalFrames / 2));
  if (effectiveTrans <= 0 || type === "cut") {
    return { opacity: 1, transform: "none" };
  }

  // ── 1. Enter phase (frames 0 → effectiveTrans) ────────────────
  if (frame < effectiveTrans) {
    switch (type) {

      case "fade": {
        const opacity = interpolate(frame, [0, effectiveTrans], [0, 1], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: "none" };
      }
      case "dissolve": {
        const opacity = interpolate(frame, [0, effectiveTrans], [0, 1], {
          extrapolateRight: "clamp",
        });
        const blur = interpolate(frame, [0, effectiveTrans], [8, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: "none", filter: `blur(${blur}px)` };
      }
      case "slide_left": {
        const x = interpolate(frame, [0, effectiveTrans], [100, 0], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(frame, [0, effectiveTrans * 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `translateX(${x}%)` };
      }
      case "slide_right": {
        const x = interpolate(frame, [0, effectiveTrans], [-100, 0], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(frame, [0, effectiveTrans * 0.5], [0, 1], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `translateX(${x}%)` };
      }
      case "zoom_in": {
        const scale = interpolate(frame, [0, effectiveTrans], [0.8, 1], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(frame, [0, effectiveTrans], [0, 1], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `scale(${scale})` };
      }
      case "zoom_out": {
        const scale = interpolate(frame, [0, effectiveTrans], [1.25, 1], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(frame, [0, effectiveTrans], [0, 1], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `scale(${scale})` };
      }
      case "glitch": {
        const opacity = interpolate(frame, [0, effectiveTrans], [0.3, 1], {
          extrapolateRight: "clamp",
        });
        const jitter = Math.sin(frame * 2.5) * 4;
        const hue = Math.floor(Math.sin(frame * 4) * 30);
        return {
          opacity,
          transform: `translateX(${jitter}px)`,
          filter: `hue-rotate(${hue}deg)`,
        };
      }
      default:
        return { opacity: 1, transform: "none" };
    }
  }

  // ── 2. Exit phase (frames totalFrames - effectiveTrans → totalFrames) ──
  const exitStart = totalFrames - effectiveTrans;
  if (frame >= exitStart) {
    const exitFrame = frame - exitStart;

    switch (type) {
      case "fade": {
        const opacity = interpolate(exitFrame, [0, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: "none" };
      }
      case "dissolve": {
        const opacity = interpolate(exitFrame, [0, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        const blur = interpolate(exitFrame, [0, effectiveTrans], [0, 8], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: "none", filter: `blur(${blur}px)` };
      }
      case "slide_left": {
        const x = interpolate(exitFrame, [0, effectiveTrans], [0, -100], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(exitFrame, [effectiveTrans * 0.5, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `translateX(${x}%)` };
      }
      case "slide_right": {
        const x = interpolate(exitFrame, [0, effectiveTrans], [0, 100], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(exitFrame, [effectiveTrans * 0.5, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `translateX(${x}%)` };
      }
      case "zoom_in": {
        const scale = interpolate(exitFrame, [0, effectiveTrans], [1, 1.25], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(exitFrame, [0, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `scale(${scale})` };
      }
      case "zoom_out": {
        const scale = interpolate(exitFrame, [0, effectiveTrans], [1, 0.8], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(exitFrame, [0, effectiveTrans], [1, 0], {
          extrapolateRight: "clamp",
        });
        return { opacity, transform: `scale(${scale})` };
      }
      case "glitch": {
        const opacity = interpolate(exitFrame, [0, effectiveTrans], [1, 0.2], {
          extrapolateRight: "clamp",
        });
        const jitter = Math.sin(exitFrame * 3) * 6;
        return {
          opacity,
          transform: `translateX(${jitter}px)`,
        };
      }
      default:
        return { opacity: 1, transform: "none" };
    }
  }

  // ── 3. Steady active phase ────────────────────────────────────
  return { opacity: 1, transform: "none" };
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  type = "fade",
  durationInFrames,
  transitionDurationFrames = 15,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const styles = getTransitionStyles(
    frame,
    durationInFrames,
    type,
    transitionDurationFrames,
    fps
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: styles.opacity,
        transform: styles.transform,
        filter: styles.filter,
      }}
    >
      {children}
    </div>
  );
};