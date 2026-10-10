import { describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("blocks once the window is full", () => {
    resetRateLimits();
    const now = 1_000_000;
    expect(rateLimit("login:test", 2, 10_000, now).ok).toBe(true);
    expect(rateLimit("login:test", 2, 10_000, now + 1).ok).toBe(true);
    const blocked = rateLimit("login:test", 2, 10_000, now + 2);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterMs).toBeGreaterThan(0);
    expect(rateLimit("login:test", 2, 10_000, now + 10_001).ok).toBe(true);
  });
});
