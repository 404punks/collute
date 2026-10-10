import type { CalloutPost, NormalizedToken } from "./types";

const fetchedAt = "2026-01-01T00:00:00.000Z";

function sampleToken(partial: Pick<NormalizedToken, "mint" | "name" | "symbol" | "description">): NormalizedToken {
  return {
    ...partial,
    descriptionSource: "coins-v2",
    imageUri: null,
    imageSource: null,
    metadataUri: null,
    creator: null,
    createdAt: fetchedAt,
    complete: false,
    bondingCurve: null,
    associatedBondingCurve: null,
    pumpSwapPool: null,
    marketCapRaw: null,
    usdMarketCap: null,
    virtualSolReserves: null,
    virtualTokenReserves: null,
    totalSupply: null,
    totalSupplyField: "total_supply",
    raydiumPool: null,
    program: null,
    replyCount: null,
    lastTradeAt: null,
    nsfw: false,
    isBanned: false,
    twitter: null,
    website: null,
    telegram: null,
    source: "development-mock",
    fetchedAt,
    degraded: false,
    missingFields: ["market_cap", "usd_market_cap", "reply_count"],
    publicPageUrl: `https://pump.fun/coin/${partial.mint}`,
    publicPageUrlOrigin: "constructed-from-mint",
  };
}

export const mockTokens: NormalizedToken[] = [
  sampleToken({
    mint: "DevMockNorth1111111111111111111111111111",
    name: "Sample Alpha",
    symbol: "SALPHA",
    description: "Development sample. This is not a Pump.fun coin.",
  }),
  sampleToken({
    mint: "DevMockBeta22222222222222222222222222222",
    name: "Sample Beta",
    symbol: "SBETA",
    description: "Development sample. This is not a Pump.fun coin.",
  }),
];

export const mockCallouts: CalloutPost[] = [
  {
    id: "dev-callout-1",
    source: "development-mock",
    creatorName: "Sample Creator",
    creatorHandle: "sample",
    body: "Sample Callout card for layout review. This text was written for Callout Social development and was not fetched from Pump.fun.",
    createdAt: "2026-01-02T15:00:00.000Z",
    token: mockTokens[0],
    originalPostUrl: null,
  },
  {
    id: "dev-callout-2",
    source: "development-mock",
    creatorName: "Sample Creator",
    creatorHandle: "sample",
    body: "A second sample card so the feed can show spacing, bookmarks, and token chips without pretending to be live.",
    createdAt: "2026-01-02T12:00:00.000Z",
    token: mockTokens[1],
    originalPostUrl: null,
  },
];

export function findMockToken(mint: string): NormalizedToken | null {
  return mockTokens.find((token) => token.mint === mint) ?? null;
}

export function findMockCallout(id: string): CalloutPost | null {
  return mockCallouts.find((post) => post.id === id) ?? null;
}
