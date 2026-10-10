import { getCurrentUser } from "@/lib/auth/session";
import { bookmarkSchema } from "@/lib/validators";
import { createBookmark, deleteBookmark, listBookmarks } from "@/lib/social/service";
import { errorResponse, json } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to see bookmarks." }, 401);
  return json({ bookmarks: await listBookmarks(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to bookmark." }, 401);
  const parsed = bookmarkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Bookmark could not be saved." }, 400);
  try {
    const result = await createBookmark(user.id, parsed.data.targetType, parsed.data.targetId);
    if ("error" in result) return json({ error: result.error }, result.status);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to bookmark." }, 401);
  const parsed = bookmarkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Bookmark could not be removed." }, 400);
  await deleteBookmark(user.id, parsed.data.targetType, parsed.data.targetId);
  return json({ ok: true });
}
