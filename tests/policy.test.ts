import { describe, expect, it } from "vitest";
import { pumpStatus, resolveDataMode } from "@/lib/pumpfun/policy";
import { findMockToken, mockCallouts } from "@/lib/pumpfun/mock";
import { isMintAddress } from "@/lib/validators";

describe("data mode", () => {
  it("never enables sample data in production", () => {
    expect(resolveDataMode({ NODE_ENV: "production", PUMPFUN_DATA_MODE: "mock" })).toBe("live");
    expect(resolveDataMode({ NODE_ENV: "development", PUMPFUN_DATA_MODE: "mock" })).toBe("development-mock");
    expect(resolveDataMode({ NODE_ENV: "development" })).toBe("live");
  });

  it("reports callouts, trending, and pump social actions as unavailable", () => {
    const status = pumpStatus("live");
    expect(status.callouts.available).toBe(false);
    expect(status.trending.available).toBe(false);
    expect(status.discussed.available).toBe(false);
    expect(status.launches.available).toBe(false);
    expect(status.streaming.available).toBe(false);
    expect(status.pumpSocialActions.available).toBe(false);
    expect(status.coinLookup.available).toBe(true);
  });

  it("keeps sample callouts labeled and free of market figures", () => {
    for (const post of mockCallouts) {
      expect(post.source).toBe("development-mock");
      expect(post.originalPostUrl).toBeNull();
      expect(post.token.usdMarketCap).toBeNull();
      expect(post.token.source).toBe("development-mock");
      expect(isMintAddress(post.token.mint)).toBe(true);
      expect(findMockToken(post.token.mint)?.name).toBe(post.token.name);
    }
  });
});
