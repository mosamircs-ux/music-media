/**
 * Sliding Window / Token Bucket Rate Limiter per provider
 */
export interface RateLimiterConfig {
  maxRequests: number; // e.g. 50 requests
  windowMs: number;    // per 60,000 ms (1 minute)
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(config: RateLimiterConfig = { maxRequests: 60, windowMs: 60000 }) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * Checks if an action is allowed under the rate limit
   */
  isAllowed(key = "default"): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Filter out timestamps older than the window
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      this.requests.set(key, validTimestamps);
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  /**
   * Returns remaining tokens / quota
   */
  getRemaining(key = "default"): number {
    const now = Date.now();
    const timestamps = (this.requests.get(key) || []).filter((t) => now - t < this.windowMs);
    return Math.max(0, this.maxRequests - timestamps.length);
  }

  /**
   * Resets rate limit tracker for a key
   */
  reset(key = "default"): void {
    this.requests.delete(key);
  }
}

export const musicRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
});
