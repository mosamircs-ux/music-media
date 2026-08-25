"use client";

import React from "react";
import { Sequence, useVideoConfig } from "remotion";
import type { Caption } from "@musicmotion/shared";
import { CaptionOverlay } from "../compositions/CaptionOverlay";

export interface CaptionTrackProps {
  captions: Caption[];
  offsetSeconds?: number;
}

/**
 * High-performance Remotion track that maps timed caption segments
 * to frame sequences with sub-frame accuracy.
 */
export const CaptionTrack: React.FC<CaptionTrackProps> = ({
  captions,
  offsetSeconds = 0,
}) => {
  const { fps } = useVideoConfig();

  return (
    <>
      {captions.map((caption) => {
        const startSec = Math.max(0, caption.startTime - offsetSeconds);
        const endSec = Math.max(startSec + 0.1, caption.endTime - offsetSeconds);
        const from = Math.round(startSec * fps);
        const durationInFrames = Math.max(1, Math.round((endSec - startSec) * fps));

        return (
          <Sequence
            key={caption.id}
            from={from}
            durationInFrames={durationInFrames}
            name={`Caption: ${caption.text.slice(0, 20)}`}
          >
            <CaptionOverlay caption={caption} />
          </Sequence>
        );
      })}
    </>
  );
};