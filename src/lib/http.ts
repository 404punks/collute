import { NextResponse } from "next/server";
import { PumpFunError } from "@/lib/pumpfun/normalize";
import { logger } from "@/lib/logger";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof PumpFunError) {
    return json({ error: error.message, code: error.code }, error.status);
  }
  logger.error("request failed", { error: error instanceof Error ? error.name : "unknown" });
  return json({ error: "Something went wrong." }, 500);
}
