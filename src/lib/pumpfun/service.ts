import "server-only";
import { isMintAddress } from "@/lib/validators";
import { fetchCoinFromPump } from "./client";
import { findMockCallout, findMockToken, mockCallouts } from "./mock";
import { PumpFunError } from "./normalize";
import { currentDataMode } from "./policy";
import type { CalloutPost, NormalizedToken } from "./types";

export async function getToken(mint: string, refresh = false): Promise<NormalizedToken> {
  if (!isMintAddress(mint)) {
    throw new PumpFunError("invalid_mint", "That mint address is not valid base58.", 400);
  }
  if (currentDataMode() === "development-mock") {
    const sample = findMockToken(mint);
    if (sample) return { ...sample, fetchedAt: new Date().toISOString() };
  }
  return fetchCoinFromPump(mint, refresh);
}

export function getCallouts(): CalloutPost[] {
  return currentDataMode() === "development-mock" ? mockCallouts : [];
}

export function getCallout(id: string): CalloutPost | null {
  if (currentDataMode() !== "development-mock") return null;
  return findMockCallout(id);
}
