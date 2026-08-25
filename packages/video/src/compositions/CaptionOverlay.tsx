"use client";

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption, CaptionPresetStyle, CaptionAnimation } from "@musicmotion/shared";
import { isRTLText } from "@musicmotion/shared";

export interface CaptionOverlayProps {
  caption: Caption;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({ caption }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isRTL = caption.isRTL ?? isRTLText(caption.text);
  const presetStyle: CaptionPresetStyle = caption.style || "Modern";
  const animType: CaptionAnimation = caption.animation || "Pop";
  const position = caption.position || "bottom";

  // Total frame duration of this caption
  const durationFrames = Math.max(1, ((caption.endTime - caption.startTime) * fps));
  const progress = Math.min(1, Math.max(0, frame / durationFrames));

  // 1. Spring & Interpolation Animations
  const popSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const slideUp = interpolate(frame, [0, 8], [24, 0], { extrapolateRight: "clamp" });
  const slideDown = interpolate(frame, [0, 8], [-24, 0], { extrapolateRight: "clamp" });

  // 2. Safe Zone Positioning (9:16 Vertical Safe Zones)
  // Top safe zone margin: 15% (avoid platform headers)
  // Bottom safe zone margin: 20% (avoid platform caption/actions)
  const getPositionStyles = (): React.CSSProperties => {
    switch (position) {
      case "top":
        return { top: "15%" };
      case "center":
        return { top: "50%", transform: "translateY(-50%)" };
      case "bottom":
      default:
        return { bottom: "20%" };
    }
  };

  // 3. Animation Transforms
  const getAnimationStyles = (): React.CSSProperties => {
    const normalizedAnim = String(animType).toLowerCase().replace(/[\s-]/g, "_");

    switch (normalizedAnim) {
      case "fade":
        return { opacity: fadeIn };
      case "slide_up":
        return { opacity: fadeIn, transform: `translateY(${slideUp}px)` };
      case "slide_down":
        return { opacity: fadeIn, transform: `translateY(${slideDown}px)` };
      case "pop":
        return { opacity: fadeIn, transform: `scale(${popSpring})` };
      case "typewriter":
      case "word_by_word":
      case "karaoke":
      default:
        return { opacity: fadeIn };
    }
  };

  // 4. Preset Styles (Modern, Minimal, Karaoke, Cinematic, Neon, Bold, Typewriter, Elegant)
  const getPresetStyles = (): { container: React.CSSProperties; text: React.CSSProperties } => {
    const arabicFont = "'Cairo', 'Tajawal', 'Noto Sans Arabic', sans-serif";
    const latinFont = "system-ui, -apple-system, 'Inter', sans-serif";
    const baseFont = isRTL ? arabicFont : (caption.fontFamily || latinFont);

    switch (presetStyle) {
      case "Minimal":
        return {
          container: {
            backgroundColor: "transparent",
            padding: "8px 16px",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 38,
            fontWeight: 800,
            color: caption.color || "#ffffff",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.9)",
          },
        };

      case "Karaoke":
        return {
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            padding: "16px 28px",
            borderRadius: 24,
            border: "1.5px solid rgba(250, 204, 21, 0.4)",
            boxShadow: "0 8px 32px rgba(250, 204, 21, 0.2)",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 42,
            fontWeight: 900,
            color: "#fef08a",
            textShadow: "0 0 12px rgba(250, 204, 21, 0.6)",
          },
        };

      case "Cinematic":
        return {
          container: {
            backgroundColor: "rgba(10, 10, 12, 0.8)",
            backdropFilter: "blur(16px)",
            padding: "14px 32px",
            borderRadius: 12,
            borderBottom: "2px solid rgba(244, 63, 94, 0.8)",
            letterSpacing: isRTL ? "normal" : "0.08em",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 36,
            fontWeight: 700,
            color: caption.color || "#ffffff",
            textTransform: isRTL ? "none" : "uppercase",
          },
        };

      case "Neon":
        return {
          container: {
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(16px)",
            padding: "16px 28px",
            borderRadius: 20,
            border: "2px solid #f43f5e",
            boxShadow: "0 0 24px rgba(244, 63, 94, 0.5)",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 44,
            fontWeight: 900,
            color: "#ffffff",
            textShadow: "0 0 10px #f43f5e, 0 0 20px #f43f5e",
          },
        };

      case "Bold":
        return {
          container: {
            backgroundColor: "#000000",
            padding: "16px 24px",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 46,
            fontWeight: 900,
            color: "#facc15",
            textTransform: "uppercase",
          },
        };

      case "Typewriter":
        return {
          container: {
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            padding: "12px 24px",
            borderRadius: 8,
            borderLeft: "4px solid #22c55e",
          },
          text: {
            fontFamily: "monospace, 'Courier New', monospace",
            fontSize: caption.fontSize || 34,
            fontWeight: 700,
            color: "#4ade80",
          },
        };

      case "Elegant":
        return {
          container: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            padding: "14px 28px",
            borderRadius: 20,
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
          },
          text: {
            fontFamily: isRTL ? arabicFont : "Georgia, serif",
            fontSize: caption.fontSize || 38,
            fontWeight: 700,
            color: "#0f172a",
          },
        };

      case "Modern":
      default:
        return {
          container: {
            backgroundColor: caption.background || "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(12px)",
            padding: "16px 28px",
            borderRadius: 20,
            border: "1px solid rgba(255, 255, 255, 0.15)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          },
          text: {
            fontFamily: baseFont,
            fontSize: caption.fontSize || 42,
            fontWeight: 800,
            color: caption.color || "#ffffff",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
          },
        };
    }
  };

  const { container: presetContainerStyle, text: presetTextStyle } = getPresetStyles();

  // 5. Text Render Engine: Normal, Typewriter, Word-by-Word, and Karaoke
  const renderTextContent = () => {
    const rawText = caption.text;
    const anim = String(animType).toLowerCase().replace(/[\s-]/g, "_");

    if (anim === "typewriter") {
      const charsToShow = Math.floor(progress * rawText.length);
      return (
        <span>
          {rawText.slice(0, charsToShow)}
          {charsToShow < rawText.length && <span style={{ opacity: Math.sin(frame * 0.5) > 0 ? 1 : 0 }}>|</span>}
        </span>
      );
    }

    if (anim === "word_by_word") {
      const words = rawText.split(" ");
      const wordsToShow = Math.floor(progress * words.length);
      return (
        <span>
          {words.map((word, i) => (
            <span
              key={i}
              style={{
                opacity: i <= wordsToShow ? 1 : 0.2,
                transition: "opacity 0.1s",
                display: "inline-block",
                marginRight: isRTL ? 0 : "0.3em",
                marginLeft: isRTL ? "0.3em" : 0,
              }}
            >
              {word}
            </span>
          ))}
        </span>
      );
    }

    if (anim === "karaoke" || presetStyle === "Karaoke") {
      const words = rawText.split(" ");
      const activeWordIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
      return (
        <span>
          {words.map((word, i) => {
            const isPast = i < activeWordIndex;
            const isCurrent = i === activeWordIndex;
            return (
              <span
                key={i}
                style={{
                  color: isCurrent ? "#facc15" : isPast ? "#fef08a" : "rgba(255, 255, 255, 0.5)",
                  transform: isCurrent ? "scale(1.1)" : "scale(1)",
                  textShadow: isCurrent ? "0 0 14px #facc15" : "none",
                  display: "inline-block",
                  marginRight: isRTL ? 0 : "0.3em",
                  marginLeft: isRTL ? "0.3em" : 0,
                  transition: "all 0.1s",
                }}
              >
                {word}
              </span>
            );
          })}
        </span>
      );
    }

    return rawText;
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 8%", // 9:16 safe side padding
        pointerEvents: "none",
        zIndex: 10,
        ...getPositionStyles(),
      }}
    >
      <div
        style={{
          ...presetContainerStyle,
          ...getAnimationStyles(),
          maxWidth: "88%",
          textAlign: isRTL ? "right" : (caption.alignment || "center"),
          transition: "transform 0.15s ease-out",
        }}
      >
        <span
          style={{
            ...presetTextStyle,
            lineHeight: 1.25,
            display: "inline-block",
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {renderTextContent()}
        </span>
      </div>
    </div>
  );
};
