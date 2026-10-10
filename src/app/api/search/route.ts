import { getToken } from "@/lib/pumpfun/service";
import { PumpFunError } from "@/lib/pumpfun/normalize";
import { pumpStatus, currentDataMode } from "@/lib/pumpfun/policy";
import { searchMembersAndPosts } from "@/lib/social/service";
import { classifyQuery } from "@/lib/validators";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { json } from "@/lib/http";

export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request, "search"), 40, 60 * 1000);
  if (!limit.ok) return json({ error: "Too many searches. Wait a moment." }, 429);
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return json({
      query,
      kind: "empty",
      users: [],
      posts: [],
      token: null,
      tokenError: null,
      status: pumpStatus(currentDataMode()),
    });
  }

  const local = await searchMembersAndPosts(query);
  if (classifyQuery(query) !== "mint") {
    return json({
      query,
      kind: "text",
      users: local.users,
      posts: local.posts,
      token: null,
      tokenError: null,
      status: pumpStatus(currentDataMode()),
    });
  }

  try {
    const token = await getToken(query);
    return json({
      query,
      kind: "mint",
      users: local.users,
      posts: local.posts,
      token,
      tokenError: null,
      status: pumpStatus(currentDataMode()),
    });
  } catch (error) {
    const message = error instanceof PumpFunError ? error.message : "Token lookup failed.";
    return json({
      query,
      kind: "mint",
      users: local.users,
      posts: local.posts,
      token: null,
      tokenError: message,
      status: pumpStatus(currentDataMode()),
    });
  }
}
