/**
 * Official Pump.fun interfaces used, or deliberately not used, by Callout Social.
 * Sources were checked against the pump-fun GitHub organization on 2026-10-10.
 * Do not add endpoints that are only known from reverse-engineered captures.
 */

export const PUMP_COINS_V2_DEFAULT_BASE = "https://frontend-api-v3.pump.fun/coins-v2";

export const PUMP_PUBLIC_CALLOUTS_PAGE = "https://pump.fun/callouts";

export function publicCoinPage(mint: string): string {
  return `https://pump.fun/coin/${encodeURIComponent(mint)}`;
}

export const officialInterfaces = {
  coinsV2: {
    method: "GET" as const,
    url: `${PUMP_COINS_V2_DEFAULT_BASE}/{mint}`,
    documentedBy: "https://github.com/pump-fun/pump-fun-skills/blob/main/create-coin/SKILL.md",
    referenceClient:
      "https://github.com/pump-fun/pump-fun-skills/blob/main/create-coin/scripts/lib/coin-api.mjs",
    auth: "None documented. The official script calls fetch(url) with no API key.",
    used: true,
  },
  createCoinAgent: {
    method: "POST" as const,
    url: "https://fun-block.pump.fun/agents/create-coin",
    documentedBy: "https://github.com/pump-fun/pump-fun-skills/blob/main/create-coin/SKILL.md",
    auth: "Request body includes the user public key. The user wallet co-signs. No API key is documented.",
    used: false,
    reason: "Callout Social does not create coins or sign transactions.",
  },
  pumpProgram: {
    id: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
    documentedBy: "https://github.com/pump-fun/pump-public-docs",
    used: false,
    reason: "Coin state shown in the product comes from the documented coins-v2 HTTP read. Trading instructions are out of scope.",
  },
} as const;

export function coinsV2Base(): string {
  const raw = process.env.PUMP_COINS_V2_BASE?.trim();
  const base = raw && raw.length > 0 ? raw : PUMP_COINS_V2_DEFAULT_BASE;
  return base.replace(/\/+$/, "");
}

export function coinsV2Url(mint: string): string {
  return `${coinsV2Base()}/${encodeURIComponent(mint)}`;
}
