export type TokenSource = "pump-coins-v2" | "development-mock";

export type NormalizedToken = {
  mint: string;
  name: string | null;
  symbol: string | null;
  description: string | null;
  descriptionSource: "coins-v2" | "metadata-uri" | null;
  imageUri: string | null;
  imageSource: "coins-v2" | "metadata-uri" | null;
  metadataUri: string | null;
  creator: string | null;
  createdAt: string | null;
  complete: boolean | null;
  bondingCurve: string | null;
  associatedBondingCurve: string | null;
  pumpSwapPool: string | null;
  /** coins-v2 `market_cap` exactly as returned. The published example does not define the unit. */
  marketCapRaw: string | null;
  usdMarketCap: number | null;
  virtualSolReserves: string | null;
  virtualTokenReserves: string | null;
  totalSupply: string | null;
  totalSupplyField: "total_supply" | "total_supply_str";
  raydiumPool: string | null;
  program: string | null;
  replyCount: number | null;
  lastTradeAt: string | null;
  /** Observed on the live documented endpoint. Not part of the published example schema. */
  nsfw: boolean | null;
  isBanned: boolean | null;
  twitter: string | null;
  website: string | null;
  telegram: string | null;
  source: TokenSource;
  fetchedAt: string;
  degraded: boolean;
  missingFields: string[];
  /** Public website path. Not a field in the coins-v2 payload. */
  publicPageUrl: string;
  publicPageUrlOrigin: "constructed-from-mint";
};

export type CalloutPost = {
  id: string;
  source: "development-mock";
  creatorName: string;
  creatorHandle: string;
  body: string;
  createdAt: string;
  token: NormalizedToken;
  originalPostUrl: null;
};

export type Capability = {
  available: boolean;
  title: string;
  detail: string;
};

export type PumpStatus = {
  mode: "live" | "development-mock";
  callouts: Capability;
  trending: Capability;
  discussed: Capability;
  launches: Capability;
  streaming: Capability;
  nameSearch: Capability;
  pumpSocialActions: Capability;
  coinLookup: Capability;
};
