import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@musicmotion/shared";

export interface CaptionOverlayProps {
  caption: Caption;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const fadeIn = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });

  const style = caption.style || {};
  const position = style.position || "bottom";

  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case "top":
        return { top: "12%" };
      case "center":
        return { top: "50%", transform: `translateY(-50%) scale(${popSpring})` };
      case "bottom":
      default:
        return { bottom: "16%" };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 48px",
        pointerEvents: "none",
        zIndex: 10,
        ...getPositionStyles(),
      }}
    >
      <div
        style={{
          transform: position !== "center" ? `scale(${popSpring})` : undefined,
          opacity: fadeIn,
          backgroundColor: style.backgroundColor || "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          padding: "16px 28px",
          borderRadius: 20,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          textAlign: "center",
          maxWidth: "90%",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        <span
          style={{
            fontFamily: style.fontFamily || "system-ui, -apple-system, sans-serif",
            fontSize: style.fontSize || 42,
            fontWeight: 800,
            color: style.textColor || "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            display: "inline-block",
          }}
        >
          {caption.text}
        </span>
      </div>
    </div>
  );
};
