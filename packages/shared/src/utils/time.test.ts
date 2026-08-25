import { describe, it, expect } from "vitest";
import {
  formatPreciseTime,
  parsePreciseTime,
  snapTime,
  validateTimeRange,
  formatTime,
  clamp,
} from "./index";

describe("Time Formatting & Parsing Calculations", () => {
  it("formats precise time in mm:ss.SSS format", () => {
    expect(formatPreciseTime(42.5)).toBe("00:42.500");
    expect(formatPreciseTime(68.2)).toBe("01:08.200");
    expect(formatPreciseTime(25.7)).toBe("00:25.700");
    expect(formatPreciseTime(0)).toBe("00:00.000");
    expect(formatPreciseTime(-5)).toBe("00:00.000");
    expect(formatPreciseTime(125.123)).toBe("02:05.123");
  });

  it("parses diverse precise time string formats", () => {
    expect(parsePreciseTime("00:42.500")).toBe(42.5);
    expect(parsePreciseTime("01:08.200")).toBe(68.2);
    expect(parsePreciseTime("00:25.700")).toBe(25.7);
    expect(parsePreciseTime("02:15")).toBe(135);
    expect(parsePreciseTime("45.5")).toBe(45.5);
    expect(parsePreciseTime("01:00:30")).toBe(3630);
    expect(parsePreciseTime("invalid")).toBeNull();
    expect(parsePreciseTime("")).toBeNull();
  });

  it("standard formatTime behaves correctly", () => {
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(65.4, true)).toBe("01:05.4");
    expect(formatTime(0)).toBe("00:00");
  });
});

describe("Snapping Calculations", () => {
  it("snaps to nearest integer second in second mode", () => {
    expect(snapTime(12.4, "second")).toBe(12);
    expect(snapTime(12.6, "second")).toBe(13);
    expect(snapTime(12.0, "second")).toBe(12);
  });

  it("snaps to beat grid according to BPM", () => {
    // 120 BPM -> 1 beat = 0.5s
    expect(snapTime(1.1, "beat", 120)).toBe(1.0);
    expect(snapTime(1.3, "beat", 120)).toBe(1.5);

    // 60 BPM -> 1 beat = 1.0s
    expect(snapTime(2.7, "beat", 60)).toBe(3.0);
  });

  it("free mode preserves millisecond precision", () => {
    expect(snapTime(12.34567, "free")).toBe(12.346);
  });
});

describe("Time Range Validation & Clamping Constraints", () => {
  it("validates valid ranges within total duration", () => {
    const res = validateTimeRange(10, 25, 180, 3, 60);
    expect(res.isValid).toBe(true);
    expect(res.start).toBe(10);
    expect(res.end).toBe(25);
    expect(res.duration).toBe(15);
  });

  it("clamps negative start to 0", () => {
    const res = validateTimeRange(-5, 20, 180, 3, 60);
    expect(res.start).toBe(0);
    expect(res.end).toBe(20);
    expect(res.duration).toBe(20);
  });

  it("enforces minimum duration when end <= start", () => {
    const res = validateTimeRange(20, 15, 180, 5, 60);
    expect(res.start).toBe(20);
    expect(res.end).toBe(25);
    expect(res.duration).toBe(5);
  });

  it("clamps to maximum allowed duration", () => {
    const res = validateTimeRange(10, 120, 180, 3, 30);
    expect(res.start).toBe(10);
    expect(res.end).toBe(40);
    expect(res.duration).toBe(30);
  });

  it("clamps to total audio duration boundary", () => {
    const res = validateTimeRange(170, 200, 180, 3, 60);
    expect(res.start).toBe(170);
    expect(res.end).toBe(180);
    expect(res.duration).toBe(10);
  });

  it("clamp utility confines numbers between bounds", () => {
    expect(clamp(150, 0, 100)).toBe(100);
    expect(clamp(-20, 0, 100)).toBe(0);
    expect(clamp(45, 0, 100)).toBe(45);
  });
});
