import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useVideoConfig,
} from "remotion";
import type { MusicMotionVideoProps } from "./types";
import { SceneView } from "./SceneView";
import { CaptionOverlay } from "./CaptionOverlay";

export const MusicMotionVideo: React.FC<MusicMotionVideoProps> = ({
  audioUrl,
  trackSelection,
  scenes,
  captions,
  watermarkText = "MusicMotion",
}) => {
  const { fps } = useVideoConfig();

  // Calculate audio start/end offsets in frames
  const audioStartFrame = Math.round(trackSelection.startTime * fps);
  const audioEndFrame = Math.round(trackSelection.endTime * fps);

  // Track cumulative sequence frame offset for scenes
  let currentSceneStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* 1. Synced Audio Segment */}
      {audioUrl && (
        <Audio
          src={audioUrl}
          startFrom={audioStartFrame}
          endAt={audioEndFrame}
          volume={1}
        />
      )}

      {/* 2. Visual Scenes Sequence */}
      <AbsoluteFill>
        {scenes.map((scene) => {
          const sceneDurationFrames = Math.max(1, Math.round(scene.duration * fps));
          const from = currentSceneStartFrame;
          currentSceneStartFrame += sceneDurationFrames;

          return (
            <Sequence
              key={scene.id}
              from={from}
              durationInFrames={sceneDurationFrames}
              name={`Scene: ${scene.prompt.slice(0, 20)}`}
            >
              <SceneView scene={scene} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* 3. Timed Captions Layer */}
      <AbsoluteFill>
        {captions.map((caption) => {
          const from = Math.round(caption.startTime * fps);
          const durationInFrames = Math.max(
            1,
            Math.round((caption.endTime - caption.startTime) * fps)
          );

          return (
            <Sequence
              key={caption.id}
              from={from}
              durationInFrames={durationInFrames}
              name={`Caption: ${caption.text.slice(0, 15)}`}
            >
              <CaptionOverlay caption={caption} />
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* 4. Elegant Watermark / Branding Badge */}
      {watermarkText && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 48,
            padding: "8px 16px",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(6px)",
            borderRadius: 999,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "rgba(255, 255, 255, 0.8)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          {watermarkText}
        </div>
      )}
    </AbsoluteFill>
  );
};
