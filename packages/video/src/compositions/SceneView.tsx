"use client";

import React from "react";
import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "@musicmotion/shared";

export interface SceneViewProps {
  scene: Scene;
}

export const SceneView: React.FC<SceneViewProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Subtle zoom/pan effect (Ken Burns style)
  const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.08], {
    extrapolateRight: "clamp",
  });

  // Fade in transition
  const opacity = interpolate(frame, [0, Math.min(fps * 0.4, 15)], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#09090b",
      }}
    >
      {scene.imageUrl ? (
        <Img
          src={scene.imageUrl}
          alt={scene.prompt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale})`,
            opacity,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
            color: "#a1a1aa",
            padding: 40,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 600, color: "#f43f5e", marginBottom: 12 }}>
            MusicMotion Scene
          </span>
          <p style={{ fontSize: 18, maxWidth: "80%" }}>{scene.prompt}</p>
        </div>
      )}
    </div>
  );
};
