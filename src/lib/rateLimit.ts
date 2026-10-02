/**
 * RATE LIMITER — sliding window, in-memory.
 *
 * Deliberately simple: this protects a single public contact form on a
 * stateless serverless deployment, where a warm instance is the only
 * memory available. It is a meaningful speed bump against casual
 * spam, not a distributed defence — a determined attacker rotating
 * IPs or forcing cold starts can still get through.
 *
 * The limit is set generously enough that several genuine messages
 * from one visitor (and a shared office/NAT IP) never get blocked.
 */

interface Bucket {
  hits: number[];
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the next slot frees up. */
  retryAfter: number;
}

export interface RateLimitOptions {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

const buckets = new Map<string, Bucket>();

/** Cap stored buckets so a spray of fake IPs cannot grow memory forever. */
const MAX_BUCKETS = 5000;

/** Sweep expired buckets occasionally rather than on every request. */
let lastSweep = Date.now();
function sweep(now: number, windowMs: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    const recent = bucket.hits.filter((t) => now - t < windowMs);
    if (recent.length === 0) buckets.delete(key);
    else bucket.hits = recent;
  }
}

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();

  sweep(now, windowMs);

  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) {
    // At capacity, drop the least recently active bucket rather than
    // refusing service to everyone.
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }

  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  return { allowed: true, remaining: limit - bucket.hits.length, retryAfter: 0 };
}

/**
 * Best-effort client identity.
 *
 * Uses the platform-provided forwarding header. This value is
 * attacker-controlled, which is fine: it only makes the limit easier to
 * evade, never harder to hit, and it is never used for authorisation.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip') ?? 'unknown';
}