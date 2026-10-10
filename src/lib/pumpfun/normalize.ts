import { httpsUrl } from "@/lib/validators";
import { publicCoinPage } from "./endpoints";
import type { NormalizedToken, TokenSource } from "./types";

const DOCUMENTED_FIELDS = [
  "name",
  "symbol",
  "description",
  "image_uri",
  "metadata_uri",
  "creator",
  "created_timestamp",
  "complete",
  "bonding_curve",
  "associated_bonding_curve",
  "pump_swap_pool",
  "market_cap",
  "usd_market_cap",
  "virtual_sol_reserves",
  "virtual_token_reserves",
  "total_supply",
  "raydium_pool",
  "program",
  "reply_count",
  "last_trade_timestamp",
] as const;

export class PumpFunError extends Error {
  constructor(
    public code: "invalid_mint" | "not_found" | "unavailable" | "malformed" | "rate_limited" | "timeout",
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "PumpFunError";
  }
}

export function timestampToIso(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  const ms = value >= 1e12 ? value : value * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  if (year < 2000 || year > 2100) return null;
  return date.toISOString();
}

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function flag(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function count(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return value;
}

export function asDecimalString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? value.toFixed(0) : String(value);
  }
  return null;
}

function imageUri(value: unknown): string | null {
  const direct = httpsUrl(value);
  if (direct) return direct;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("ipfs://")) return null;
  const cid = trimmed.slice("ipfs://".length).replace(/^ipfs\//, "");
  if (!cid) return null;
  return `https://ipfs.io/ipfs/${cid}`;
}

export function normalizeCoinV2(
  raw: unknown,
  requestedMint: string,
  options?: { fetchedAt?: string; degraded?: boolean; source?: TokenSource },
): NormalizedToken {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new PumpFunError("malformed", "coins-v2 returned a response that is not a coin object.", 502);
  }
  const record = raw as Record<string, unknown>;
  if ("statusCode" in record && record.mint === undefined) {
    throw new PumpFunError("malformed", "coins-v2 returned an error object instead of a coin.", 502);
  }

  const reportedMint = text(record.mint);
  if (reportedMint && reportedMint !== requestedMint) {
    throw new PumpFunError(
      "malformed",
      "coins-v2 returned a coin whose mint does not match the request.",
      502,
    );
  }

  const missingFields = DOCUMENTED_FIELDS.filter((field) => record[field] === undefined || record[field] === null);
  const supplyStr = asDecimalString(record.total_supply_str);
  const supply = asDecimalString(record.total_supply);

  return {
    mint: requestedMint,
    name: text(record.name),
    symbol: text(record.symbol),
    description: text(record.description),
    descriptionSource: text(record.description) ? "coins-v2" : null,
    imageUri: imageUri(record.image_uri),
    imageSource: imageUri(record.image_uri) ? "coins-v2" : null,
    metadataUri: httpsUrl(record.metadata_uri),
    creator: text(record.creator),
    createdAt: timestampToIso(record.created_timestamp),
    complete: flag(record.complete),
    bondingCurve: text(record.bonding_curve),
    associatedBondingCurve: text(record.associated_bonding_curve),
    pumpSwapPool: text(record.pump_swap_pool),
    marketCapRaw: asDecimalString(record.market_cap),
    usdMarketCap: count(record.usd_market_cap),
    virtualSolReserves: asDecimalString(record.virtual_sol_reserves),
    virtualTokenReserves: asDecimalString(record.virtual_token_reserves),
    totalSupply: supplyStr ?? supply,
    totalSupplyField: supplyStr ? "total_supply_str" : "total_supply",
    raydiumPool: text(record.raydium_pool),
    program: text(record.program),
    replyCount: count(record.reply_count) === null ? null : Math.round(count(record.reply_count) as number),
    lastTradeAt: timestampToIso(record.last_trade_timestamp),
    nsfw: flag(record.nsfw),
    isBanned: flag(record.is_banned),
    twitter: httpsUrl(record.twitter),
    website: httpsUrl(record.website),
    telegram: httpsUrl(record.telegram),
    source: options?.source ?? "pump-coins-v2",
    fetchedAt: options?.fetchedAt ?? new Date().toISOString(),
    degraded: options?.degraded ?? false,
    missingFields: [...missingFields],
    publicPageUrl: publicCoinPage(requestedMint),
    publicPageUrlOrigin: "constructed-from-mint",
  };
}

export function applyMetadata(token: NormalizedToken, raw: unknown): NormalizedToken {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return token;
  const record = raw as Record<string, unknown>;
  const description = token.description ?? text(record.description);
  const image = token.imageUri ?? imageUri(record.image);
  return {
    ...token,
    description,
    descriptionSource: token.description ? token.descriptionSource : description ? "metadata-uri" : null,
    imageUri: image,
    imageSource: token.imageUri ? token.imageSource : image ? "metadata-uri" : null,
    twitter: token.twitter ?? httpsUrl(record.twitter),
    website: token.website ?? httpsUrl(record.website),
    telegram: token.telegram ?? httpsUrl(record.telegram),
  };
}
