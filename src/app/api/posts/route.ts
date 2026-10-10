import { getCurrentUser } from "@/lib/auth/session";
import { createPost, listPosts } from "@/lib/social/service";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { postSchema } from "@/lib/validators";
import { errorResponse, json } from "@/lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const user = await getCurrentUser();
  const scope = url.searchParams.get("scope");
  try {
    if (scope === "following") {
      if (!user) return json({ error: "Sign in to see posts from people you follow." }, 401);
      const { prisma } = await import("@/lib/db");
      const follows = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      });
      const authorIds = follows.map((row) => row.followingId);
      if (authorIds.length === 0) return json({ posts: [], nextCursor: null });
      return json(
        await listPosts({
          authorIds,
          cursor: url.searchParams.get("cursor"),
          viewerId: user.id,
        }),
      );
    }
    return json(
      await listPosts({
        cursor: url.searchParams.get("cursor"),
        authorId: url.searchParams.get("authorId") ?? undefined,
        mint: url.searchParams.get("mint") ?? undefined,
        viewerId: user?.id ?? null,
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to post on Callout Social." }, 401);
  const limit = rateLimit(clientKey(request, `post:${user.id}`), 20, 10 * 60 * 1000);
  if (!limit.ok) return json({ error: "You are posting too quickly." }, 429);
  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Post could not be saved." }, 400);
  const post = await createPost(user.id, parsed.data.body, parsed.data.mint);
  return json({ post }, 201);
}
