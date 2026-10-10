import "server-only";
import { logger } from "@/lib/logger";
import { coinsV2Url } from "./endpoints";
import { applyMetadata, normalizeCoinV2, PumpFunError } from "./normalize";
import type { NormalizedToken } from "./types";

type CacheEntry = {
  token: NormalizedToken | null;
  etag?: string;
  freshUntil: number;
  staleUntil: number;
};

const cache = new Map<string, CacheEntry>();
const FRESH_MS = 30_000;
const STALE_MS = 5 * 60_000;

let pauseUntil = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(response: Response, attempt: number): number {
  const header = response.headers.get("retry-after");
  const parsed = header ? Number(header) : NaN;
  if (Number.isFinite(parsed) && parsed >= 0) return Math.min(parsed * 1000, 2000);
  return Math.min(250 * 2 ** attempt, 2000);
}

function noteRateLimit(response: Response) {
  const remaining = response.headers.get("x-ratelimit-remaining");
  const reset = response.headers.get("x-ratelimit-reset");
  if (remaining !== "0") return;
  const resetValue = reset ? Number(reset) : 60;
  const seconds = Number.isFinite(resetValue) && resetValue < 1_000_000 ? resetValue : 60;
  pauseUntil = Date.now() + Math.min(seconds, 60) * 1000;
}

async function readJson(response: Response, mint: string): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) {
    throw new PumpFunError("malformed", `coins-v2 returned an empty body for ${mint}.`, 502);
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new PumpFunError("malformed", `coins-v2 returned invalid JSON for ${mint}.`, 502);
  }
}

export async function fetchCoinFromPump(mint: string, refresh = false): Promise<NormalizedToken> {
  const now = Date.now();
  const cached = cache.get(mint);
  if (!refresh && cached?.token && cached.freshUntil > now) return cached.token;

  if (pauseUntil > now) {
    if (cached?.token && cached.staleUntil > now) return { ...cached.token, degraded: true };
    throw new PumpFunError(
      "rate_limited",
      "Pump.fun rate limit is exhausted for this server. Try again shortly.",
      429,
    );
  }

  const url = coinsV2Url(mint);
  let response: Response | null = null;
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (cached?.etag && !refresh) headers["If-None-Match"] = cached.etag;
      response = await fetch(url, {
        method: "GET",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      lastError = error;
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      if (attempt === 2) {
        if (cached?.token && cached.staleUntil > now) return { ...cached.token, degraded: true };
        throw new PumpFunError(
          timedOut ? "timeout" : "unavailable",
          timedOut
            ? "The Pump.fun coin request timed out."
            : "The Pump.fun coin request could not be completed.",
          504,
        );
      }
      await sleep(200 * 2 ** attempt);
      continue;
    }

    if (response.status === 304 && cached?.token) {
      cached.freshUntil = Date.now() + FRESH_MS;
      cached.staleUntil = Date.now() + STALE_MS;
      return cached.token;
    }

    if (response.status === 404) {
      cache.set(mint, { token: null, freshUntil: Date.now() + 10_000, staleUntil: Date.now() + 10_000 });
      throw new PumpFunError("not_found", "Pump.fun has no coin for that mint.", 404);
    }

    if (response.status === 429 || response.status >= 500) {
      noteRateLimit(response);
      if (attempt === 2) break;
      await sleep(retryDelay(response, attempt));
      continue;
    }

    if (!response.ok) {
      logger.warn("coins-v2 unexpected status", { mint, status: response.status });
      throw new PumpFunError("unavailable", `coins-v2 returned HTTP ${response.status}.`, 502);
    }

    noteRateLimit(response);
    const degraded = response.headers.get("x-degraded") !== null;
    const body = await readJson(response, mint);
    let token = normalizeCoinV2(body, mint, { degraded, fetchedAt: new Date().toISOString() });
    token = await enrichMetadata(token);
    cache.set(mint, {
      token,
      etag: response.headers.get("etag") ?? undefined,
      freshUntil: Date.now() + FRESH_MS,
      staleUntil: Date.now() + STALE_MS,
    });
    logger.info("coins-v2 fetched", { mint, status: response.status, degraded });
    return token;
  }

  if (cached?.token && cached.staleUntil > now) return { ...cached.token, degraded: true };
  logger.error("coins-v2 failed", {
    mint,
    status: response?.status ?? null,
    error: lastError instanceof Error ? lastError.name : null,
  });
  if (response?.status === 429) {
    throw new PumpFunError("rate_limited", "Pump.fun rate limited this server. Try again shortly.", 429);
  }
  throw new PumpFunError("unavailable", "Pump.fun coin data is temporarily unavailable.", 503);
}

async function enrichMetadata(token: NormalizedToken): Promise<NormalizedToken> {
  if (!token.metadataUri || (token.description && token.imageUri)) return token;
  try {
    const response = await fetch(token.metadataUri, {
      redirect: "manual",
      signal: AbortSignal.timeout(5000),
      headers: { Accept: "application/json" },
    });
    if (response.status !== 200) return token;
    const text = await response.text();
    if (text.length > 200_000) return token;
    return applyMetadata(token, JSON.parse(text) as unknown);
  } catch (error) {
    logger.info("metadata uri skipped", {
      mint: token.mint,
      error: error instanceof Error ? error.name : "unknown",
    });
    return token;
  }
}

export function clearCoinCache() {
  cache.clear();
  pauseUntil = 0;
}
