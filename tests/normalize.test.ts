import { describe, expect, it } from "vitest";
import { applyMetadata, asDecimalString, normalizeCoinV2, PumpFunError, timestampToIso } from "@/lib/pumpfun/normalize";

const fartcoin = {
  mint: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
  name: "Fartcoin ",
  symbol: "Fartcoin ",
  image_uri: "https://ipfs.io/ipfs/QmQr3Fz4h1etNsF7oLGMRHiCzhB5y9a7GjyodnF7zLHK1g",
  metadata_uri: "https://ipfs.io/ipfs/QmYfe8zVGHA1heej47AkBX3Nnetg2h2kqj5yymz1xyKeHb",
  creator: "HyYNVYmnFmi87NsQqWzLJhUTPBKQUfgfhdbBa554nMFF",
  created_timestamp: 1729231506539,
  complete: true,
  bonding_curve: "TBHe5tJnuT4CQbHorJ1uVdfUoaYGPKgfCpiv2jgesVN",
  associated_bonding_curve: "4oPaRNdUyHNPn7oba9RnY66mkCUeUMZNVLmJ2X6J5a4Z",
  market_cap: 1479407.9641910202,
  usd_market_cap: 162409406.3088902,
  virtual_sol_reserves: 115005359177,
  virtual_token_reserves: 279900000000000,
  total_supply: 999978899969322,
  total_supply_str: "999978899969322",
  raydium_pool: "Bzc9NZfMqkXR6fz1DBph7BDf9BroyEf6pnzESP7v5iiw",
  program: "pump",
  reply_count: 14017,
  last_trade_timestamp: 1791601248000,
  verified: true,
  volume_1h_usd: 4346.85,
  security_verdict: { verdict: "allow" },
  nsfw: false,
  is_banned: false,
  twitter: "https://x.com/fartcoinofsol",
  website: "https://example.com/coin",
};

describe("normalizeCoinV2", () => {
  it("maps documented coins-v2 fields and ignores trust and volume fields", () => {
    const token = normalizeCoinV2(fartcoin, fartcoin.mint, { fetchedAt: "2026-10-10T00:00:00.000Z" });
    expect(token.name).toBe("Fartcoin");
    expect(token.symbol).toBe("Fartcoin");
    expect(token.usdMarketCap).toBe(162409406.3088902);
    expect(token.marketCapRaw).toBe("1479407.9641910202");
    expect(token.complete).toBe(true);
    expect(token.replyCount).toBe(14017);
    expect(token.totalSupply).toBe("999978899969322");
    expect(token.totalSupplyField).toBe("total_supply_str");
    expect(token.createdAt).toBe(new Date(1729231506539).toISOString());
    expect(token.twitter).toBe("https://x.com/fartcoinofsol");
    expect(token.source).toBe("pump-coins-v2");
    expect(token.publicPageUrlOrigin).toBe("constructed-from-mint");
    expect(token).not.toHaveProperty("verified");
    expect(JSON.stringify(token)).not.toContain("volume_1h_usd");
    expect(JSON.stringify(token)).not.toContain("security_verdict");
    expect(token.missingFields).toContain("description");
    expect(token.missingFields).toContain("pump_swap_pool");
  });

  it("accepts the published example timestamp in seconds", () => {
    expect(timestampToIso(1700000000)).toBe(new Date(1700000000 * 1000).toISOString());
  });

  it("keeps integer reserves as decimal strings", () => {
    expect(asDecimalString(30000000000)).toBe("30000000000");
  });

  it("maps ipfs image URIs onto the public https gateway", () => {
    const token = normalizeCoinV2(
      { ...fartcoin, image_uri: "ipfs://bafyexample" },
      fartcoin.mint,
    );
    expect(token.imageUri).toBe("https://ipfs.io/ipfs/bafyexample");
  });

  it("rejects malformed payloads and mint mismatches", () => {
    expect(() => normalizeCoinV2([], fartcoin.mint)).toThrow(PumpFunError);
    expect(() => normalizeCoinV2({ statusCode: 404, message: "nope" }, fartcoin.mint)).toThrow(PumpFunError);
    expect(() => normalizeCoinV2({ ...fartcoin, mint: "other" }, fartcoin.mint)).toThrow(/does not match/);
  });

  it("fills gaps from the metadata document without replacing coins-v2 values", () => {
    const token = normalizeCoinV2({ ...fartcoin, description: null, image_uri: null }, fartcoin.mint);
    const merged = applyMetadata(token, {
      description: "From metadata",
      image: "https://ipfs.io/ipfs/image",
      twitter: "https://x.com/other",
      telegram: "https://t.me/example",
    });
    expect(merged.description).toBe("From metadata");
    expect(merged.descriptionSource).toBe("metadata-uri");
    expect(merged.imageUri).toBe("https://ipfs.io/ipfs/image");
    expect(merged.twitter).toBe("https://x.com/fartcoinofsol");
    expect(merged.telegram).toBe("https://t.me/example");
  });
});
