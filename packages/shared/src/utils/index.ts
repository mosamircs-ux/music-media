/**
 * Format seconds into mm:ss.SSS (e.g. 00:42.500)
 */
export function formatPreciseTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00.000";
  const totalMs = Math.round(seconds * 1000);
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");
  const formattedMs = String(ms).padStart(3, "0");

  return `${formattedMins}:${formattedSecs}.${formattedMs}`;
}


/**
 * Parses a time string (e.g. "00:42.500", "01:08", "45.2", "90") into seconds
 */
export function parsePreciseTime(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const trimmed = timeStr.trim();

  // Pattern 1: mm:ss.SSS or mm:ss
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length === 2) {
      const mins = Number(parts[0]);
      const secs = Number(parts[1]);
      if (!isNaN(mins) && !isNaN(secs) && mins >= 0 && secs >= 0 && secs < 60) {
        return mins * 60 + secs;
      }
    } else if (parts.length === 3) {
      const hours = Number(parts[0]);
      const mins = Number(parts[1]);
      const secs = Number(parts[2]);
      if (!isNaN(hours) && !isNaN(mins) && !isNaN(secs) && hours >= 0 && mins >= 0 && mins < 60 && secs >= 0 && secs < 60) {
        return hours * 3600 + mins * 60 + secs;
      }
    }
    return null;
  }

  // Pattern 2: Raw seconds (e.g. "42.5")
  const rawNum = Number(trimmed);
  if (!isNaN(rawNum) && rawNum >= 0) {
    return rawNum;
  }

  return null;
}

export type SnappingMode = "free" | "beat" | "second";

/**
 * Snaps time to specific intervals based on mode
 */
export function snapTime(time: number, mode: SnappingMode, bpm = 120): number {
  if (isNaN(time) || time < 0) return 0;

  switch (mode) {
    case "second": {
      return Math.round(time);
    }
    case "beat": {
      const validBpm = bpm > 0 ? bpm : 120;
      const beatDuration = 60 / validBpm; // duration of 1 quarter note in seconds
      return Math.round(time / beatDuration) * beatDuration;
    }
    case "free":
    default: {
      return Math.round(time * 1000) / 1000;
    }
  }
}

export interface TimeRangeValidationResult {
  isValid: boolean;
  error?: string;
  start: number;
  end: number;
  duration: number;
}

/**
 * Validates and clamps a timeline selection range
 */
export function validateTimeRange(
  rawStart: number,
  rawEnd: number,
  totalDuration: number,
  minDuration = 1,
  maxDuration = 60
): TimeRangeValidationResult {
  const safeTotal = Math.max(1, totalDuration || 1);
  let start = clamp(rawStart, 0, safeTotal);
  let end = clamp(rawEnd, 0, safeTotal);

  if (start >= end) {
    end = Math.min(safeTotal, start + minDuration);
    if (end - start < minDuration && start > 0) {
      start = Math.max(0, end - minDuration);
    }
  }

  let duration = end - start;

  if (duration < minDuration) {
    end = Math.min(safeTotal, start + minDuration);
    duration = end - start;
  }

  if (duration > maxDuration) {
    end = start + maxDuration;
    if (end > safeTotal) {
      end = safeTotal;
      start = Math.max(0, end - maxDuration);
    }
    duration = end - start;
  }

  const isValid = start >= 0 && end <= safeTotal && start < end && duration >= minDuration;

  return {
    isValid,
    error: isValid ? undefined : "Invalid selection time range",
    start: Math.round(start * 1000) / 1000,
    end: Math.round(end * 1000) / 1000,
    duration: Math.round(duration * 1000) / 1000,
  };
}

/**
 * Format seconds into mm:ss or mm:ss.ms
 */
export function formatTime(seconds: number, includeMs = false): string {

  if (isNaN(seconds) || seconds < 0) return includeMs ? "00:00.0" : "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);

  const formattedMins = String(mins).padStart(2, "0");
  const formattedSecs = String(secs).padStart(2, "0");

  if (includeMs) {
    return `${formattedMins}:${formattedSecs}.${ms}`;
  }
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID (lightweight UUID v4 fallback)
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Converts seconds to Remotion frame count
 */
export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps);
}

/**
 * Converts Remotion frames to seconds
 */
export function framesToSeconds(frames: number, fps: number): number {
  return frames / fps;
}

/**
 * Detects if a text string is Arabic/Hebrew/RTL
 */
export function isRTLText(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  // Arabic, Hebrew, Syriac, Thaana, Samaritan, Mandaic Unicode blocks
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlRegex.test(text);
}

/**
 * Splits a caption into two parts at a specified time or midpoint
 */
export function splitCaption<
  T extends { id: string; projectId: string; text: string; startTime: number; endTime: number; isRTL?: boolean },
>(caption: T, splitTime?: number): [T, T] {
  const duration = caption.endTime - caption.startTime;
  const effectiveSplitTime =
    splitTime !== undefined && splitTime > caption.startTime && splitTime < caption.endTime
      ? splitTime
      : caption.startTime + duration / 2;

  const words = caption.text.trim().split(/\s+/);
  let text1 = caption.text;
  let text2 = caption.text;

  if (words.length > 1) {
    const midWord = Math.floor(words.length / 2);
    text1 = words.slice(0, midWord).join(" ");
    text2 = words.slice(midWord).join(" ");
  } else {
    text1 = `${caption.text} (1)`;
    text2 = `${caption.text} (2)`;
  }

  const cap1: T = {
    ...caption,
    id: generateId(),
    text: text1,
    startTime: Math.round(caption.startTime * 1000) / 1000,
    endTime: Math.round(effectiveSplitTime * 1000) / 1000,
    isRTL: isRTLText(text1),
  };

  const cap2: T = {
    ...caption,
    id: generateId(),
    text: text2,
    startTime: Math.round(effectiveSplitTime * 1000) / 1000,
    endTime: Math.round(caption.endTime * 1000) / 1000,
    isRTL: isRTLText(text2),
  };

  return [cap1, cap2];
}

/**
 * Merges two adjacent captions into a single continuous caption
 */
export function mergeCaptions<
  T extends { id: string; projectId: string; text: string; startTime: number; endTime: number; isRTL?: boolean },
>(caption1: T, caption2: T): T {
  const first = caption1.startTime <= caption2.startTime ? caption1 : caption2;
  const second = caption1.startTime <= caption2.startTime ? caption2 : caption1;
  const mergedText = `${first.text} ${second.text}`.trim();

  return {
    ...first,
    id: generateId(),
    text: mergedText,
    startTime: Math.min(first.startTime, second.startTime),
    endTime: Math.max(first.endTime, second.endTime),
    isRTL: isRTLText(mergedText),
  };
}

/**
 * Duplicates a caption with an optional forward time offset
 */
export function duplicateCaption<
  T extends { id: string; projectId: string; text: string; startTime: number; endTime: number; isRTL?: boolean },
>(caption: T, timeOffset = 0.5): T {
  const duration = caption.endTime - caption.startTime;
  const newStart = caption.endTime + timeOffset;
  const newEnd = newStart + duration;

  return {
    ...caption,
    id: generateId(),
    startTime: Math.round(newStart * 1000) / 1000,
    endTime: Math.round(newEnd * 1000) / 1000,
    isRTL: isRTLText(caption.text),
  };
}


/**
 * Validates and sorts a list of captions within total composition duration
 */
export function validateCaptionTimings<T extends { startTime: number; endTime: number }>(
  captions: T[],
  totalDuration: number
): T[] {
  const safeTotal = Math.max(1, totalDuration || 60);

  return [...captions]
    .map((c) => {
      const start = clamp(c.startTime, 0, safeTotal);
      let end = clamp(c.endTime, start + 0.2, safeTotal);
      if (end <= start) end = Math.min(safeTotal, start + 0.5);

      return {
        ...c,
        startTime: Math.round(start * 1000) / 1000,
        endTime: Math.round(end * 1000) / 1000,
      };
    })
    .sort((a, b) => a.startTime - b.startTime);
}



