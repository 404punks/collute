import { getCurrentUser } from "@/lib/auth/session";
import { recordLookup } from "@/lib/social/service";
import { isBookmarked } from "@/lib/social/service";
import { getToken } from "@/lib/pumpfun/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { errorResponse, json } from "@/lib/http";

export async function GET(request: Request, context: { params: Promise<{ mint: string }> }) {
  const limit = rateLimit(clientKey(request, "token"), 30, 60 * 1000);
  if (!limit.ok) return json({ error: "Too many token lookups. Wait a moment." }, 429);
  const { mint } = await context.params;
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  try {
    const token = await getToken(mint, refresh);
    const user = await getCurrentUser();
    await recordLookup(user?.id ?? null, token);
    const bookmarked = await isBookmarked(user?.id ?? null, "token", token.mint);
    return json({ token, bookmarked });
  } catch (error) {
    return errorResponse(error);
  }
}
