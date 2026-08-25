import { describe, it, expect } from "vitest";
import {
  isRTLText,
  splitCaption,
  mergeCaptions,
  duplicateCaption,
  validateCaptionTimings,
} from "./index";

describe("Caption RTL Detection & Unicode Handling", () => {
  it("accurately detects Arabic text as RTL", () => {
    expect(isRTLText("مرحباً بالعالم")).toBe(true);
    expect(isRTLText("أغنية جميلة جداً")).toBe(true);
    expect(isRTLText("كلمات الأغنية")).toBe(true);
  });

  it("accurately detects Hebrew text as RTL", () => {
    expect(isRTLText("שלום עולם")).toBe(true);
  });

  it("detects Latin and standard English text as LTR", () => {
    expect(isRTLText("Turn music into visual stories")).toBe(false);
    expect(isRTLText("12345 !@#$%")).toBe(false);
  });

  it("handles mixed language strings with Arabic appropriately", () => {
    expect(isRTLText("MusicMotion - مرحباً")).toBe(true);
    expect(isRTLText("🚀 Neon Glow 100%")).toBe(false);
  });
});

describe("Caption CRUD Operations (Split, Merge, Duplicate, Validate)", () => {
  const sampleCaption = {
    id: "cap-1",
    projectId: "proj-1",
    text: "I remember everything from yesterday",
    startTime: 2.0,
    endTime: 6.0,
  };

  it("splits multi-word caption at midpoint into two valid segments", () => {
    const [c1, c2] = splitCaption(sampleCaption);

    expect(c1.id).not.toBe(sampleCaption.id);
    expect(c2.id).not.toBe(sampleCaption.id);
    expect(c1.id).not.toBe(c2.id);

    expect(c1.startTime).toBe(2.0);
    expect(c1.endTime).toBe(4.0);
    expect(c2.startTime).toBe(4.0);
    expect(c2.endTime).toBe(6.0);

    expect(c1.text).toBe("I remember");
    expect(c2.text).toBe("everything from yesterday");
  });

  it("splits single word caption gracefully", () => {
    const singleWord = { ...sampleCaption, text: "Unstoppable" };
    const [c1, c2] = splitCaption(singleWord, 3.5);

    expect(c1.startTime).toBe(2.0);
    expect(c1.endTime).toBe(3.5);
    expect(c2.startTime).toBe(3.5);
    expect(c2.endTime).toBe(6.0);
    expect(c1.text).toContain("Unstoppable (1)");
    expect(c2.text).toContain("Unstoppable (2)");
  });

  it("merges two adjacent captions into continuous text and timing", () => {
    const capA = { id: "a", projectId: "p", text: "Part one", startTime: 1.0, endTime: 3.0 };
    const capB = { id: "b", projectId: "p", text: "and part two", startTime: 3.0, endTime: 5.5 };

    const merged = mergeCaptions(capA, capB);

    expect(merged.text).toBe("Part one and part two");
    expect(merged.startTime).toBe(1.0);
    expect(merged.endTime).toBe(5.5);
  });

  it("duplicates caption with forward time offset", () => {
    const duplicated = duplicateCaption(sampleCaption, 1.0);

    expect(duplicated.id).not.toBe(sampleCaption.id);
    expect(duplicated.text).toBe(sampleCaption.text);
    expect(duplicated.startTime).toBe(7.0); // 6.0 + 1.0
    expect(duplicated.endTime).toBe(11.0);  // 7.0 + 4.0
  });

  it("validates and sorts caption timings within composition boundaries", () => {
    const unordered = [
      { id: "3", text: "Three", startTime: 10, endTime: 12 },
      { id: "1", text: "One", startTime: -2, endTime: 3 },
      { id: "2", text: "Two", startTime: 4, endTime: 25 },
    ];

    const validated = validateCaptionTimings(unordered, 15);

    expect(validated[0].startTime).toBe(0); // clamped from -2
    expect(validated[1].startTime).toBe(4);
    expect(validated[1].endTime).toBe(15);  // clamped from 25
    expect(validated[2].startTime).toBe(10);
  });
});
