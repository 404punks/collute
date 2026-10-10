type Bucket = number[];

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const recent = (buckets.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    const retryAfterMs = windowMs - (now - recent[0]);
    return { ok: false as const, retryAfterMs };
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) {
    buckets.clear();
    buckets.set(key, recent);
  }
  return { ok: true as const, retryAfterMs: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}
