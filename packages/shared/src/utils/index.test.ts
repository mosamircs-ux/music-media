import { describe, it, expect } from "vitest";
import { formatTime, clamp, generateId, secondsToFrames, framesToSeconds } from "./index";

describe("Shared Utility Functions", () => {
  it("formatTime formats seconds properly into mm:ss", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(65)).toBe("01:05");
    expect(formatTime(120)).toBe("02:00");
  });

  it("formatTime formats milliseconds when requested", () => {
    expect(formatTime(5.4, true)).toBe("00:05.4");
  });

  it("clamp keeps values within specified range", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("generateId creates valid string identifier", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("secondsToFrames and framesToSeconds convert properly", () => {
    expect(secondsToFrames(2, 30)).toBe(60);
    expect(framesToSeconds(60, 30)).toBe(2);
  });
});
