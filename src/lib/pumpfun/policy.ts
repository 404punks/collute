import type { PumpStatus } from "./types";

export function resolveDataMode(env: {
  NODE_ENV?: string;
  PUMPFUN_DATA_MODE?: string;
}): "live" | "development-mock" {
  if (env.NODE_ENV === "production") return "live";
  if (env.PUMPFUN_DATA_MODE === "mock") return "development-mock";
  return "live";
}

export function currentDataMode(): "live" | "development-mock" {
  return resolveDataMode({
    NODE_ENV: process.env.NODE_ENV,
    PUMPFUN_DATA_MODE: process.env.PUMPFUN_DATA_MODE,
  });
}

const blocked = (title: string, detail: string): { available: false; title: string; detail: string } => ({
  available: false,
  title,
  detail,
});

export function pumpStatus(mode: "live" | "development-mock"): PumpStatus {
  return {
    mode,
    callouts: blocked(
      "Callout feed",
      "Pump.fun has not published a Callout feed endpoint. Posts on pump.fun/callouts are not copied from unofficial APIs.",
    ),
    trending: blocked(
      "Trending tokens",
      "No documented endpoint returns a trending or ranked token list.",
    ),
    discussed: blocked(
      "Most discussed",
      "coins-v2 can include reply_count for one mint. It does not provide a ranking across tokens.",
    ),
    launches: blocked(
      "New launches",
      "No documented endpoint lists newly created coins or new Callouts.",
    ),
    streaming: blocked(
      "Live updates",
      "No documented streaming interface exists for Callouts or coin prices. Token pages refresh on request.",
    ),
    nameSearch: blocked(
      "Search by name or symbol",
      "The documented read endpoint looks up one mint. It does not search names or symbols.",
    ),
    pumpSocialActions: blocked(
      "Pump.fun likes, replies, and publishing",
      "Displaying a coin does not grant permission to post, like, or reply on Pump.fun. Those actions are not implemented.",
    ),
    coinLookup: {
      available: true,
      title: "Coin by mint",
      detail: "GET https://frontend-api-v3.pump.fun/coins-v2/{mint}. No API key is documented.",
    },
  };
}
