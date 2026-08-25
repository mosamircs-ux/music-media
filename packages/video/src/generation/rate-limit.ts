/**
 * In-memory per-project rate limiter for visual generation requests.
 * Prevents hammering the provider with too many simultaneous jobs.
 *
 * In a multi-instance production environment, replace this with a
 * Redis-backed rate limiter (e.g. rate-limiter-flexible).
 */

export class RateLimitError extends Error {
  readonly statusCode = 429;
  constructor(projectId: string, limitPerMinute: number) {
    super(
      `Rate limit exceeded for project ${projectId}: max ${limitPerMinute} generation requests per minute`
    );
    this.name = "RateLimitError";
  }
}

interface Bucket {
  count: number;
  windowStart: number; // unix timestamp ms
}

const buckets = new Map<string, Bucket>();

function getLimitPerMinute(): number {
  const env = process.env.GENERATION_RATE_LIMIT_PER_MINUTE;
  return env ? parseInt(env, 10) : 10;
}

/**
 * Checks and increments the rate limit bucket for the given key.
 * Throws `RateLimitError` if the limit is exceeded.
 *
 * @param key - Typically `projectId`, but can be any discriminator.
 */
export function checkRateLimit(key: string): void {
  const limitPerMinute = getLimitPerMinute();
  const now = Date.now();
  const windowMs = 60_000;

  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    // Start a new 1-minute window
    buckets.set(key, { count: 1, windowStart: now });
    return;
  }

  if (bucket.count >= limitPerMinute) {
    throw new RateLimitError(key, limitPerMinute);
  }

  bucket.count += 1;
}

/** Expose current count for a key (useful in tests). */
export function getRateLimitCount(key: string): number {
  return buckets.get(key)?.count ?? 0;
}

/** Reset the bucket for a key (useful in tests). */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
