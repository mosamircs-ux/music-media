import { describe, it, expect } from "vitest";
import { getTransitionStyles } from "../transitions/TransitionManager";

describe("TransitionManager Styles", () => {
  it("returns opacity 1 and transform none for cut transition", () => {
    const styles = getTransitionStyles(0, 100, "cut", 15);
    expect(styles.opacity).toBe(1);
    expect(styles.transform).toBe("none");
  });

  it("calculates fade transition enter and exit curves", () => {
    // Enter phase: frame 0 -> 0 opacity
    const enterStart = getTransitionStyles(0, 100, "fade", 15);
    expect(enterStart.opacity).toBeCloseTo(0, 1);

    // Steady phase: frame 50 -> 1 opacity
    const steady = getTransitionStyles(50, 100, "fade", 15);
    expect(steady.opacity).toBe(1);

    // Exit phase: frame 100 -> 0 opacity
    const exitEnd = getTransitionStyles(100, 100, "fade", 15);
    expect(exitEnd.opacity).toBeCloseTo(0, 1);
  });

  it("calculates slide_left transform", () => {
    const enterStart = getTransitionStyles(0, 100, "slide_left", 15);
    expect(enterStart.transform).toContain("translateX(100%)");

    const steady = getTransitionStyles(50, 100, "slide_left", 15);
    expect(steady.transform).toBe("none");
  });

  it("calculates zoom_in scale transform", () => {
    const enterStart = getTransitionStyles(0, 100, "zoom_in", 15);
    expect(enterStart.transform).toContain("scale(0.8)");

    const steady = getTransitionStyles(50, 100, "zoom_in", 15);
    expect(steady.transform).toBe("none");
  });

  it("calculates dissolve blur filter", () => {
    const enterStart = getTransitionStyles(0, 100, "dissolve", 15);
    expect(enterStart.filter).toContain("blur(");
  });

  it("calculates glitch transform jitter", () => {
    const enter = getTransitionStyles(2, 100, "glitch", 15);
    expect(enter.transform).toContain("translateX(");
  });
});