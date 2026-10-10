import { getCurrentUser } from "@/lib/auth/session";
import { followSchema } from "@/lib/validators";
import { setFollow } from "@/lib/social/service";
import { json } from "@/lib/http";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to follow members." }, 401);
  const parsed = followSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Could not update that follow." }, 400);
  const result = await setFollow(user.id, parsed.data.userId, true);
  if ("error" in result) return json({ error: result.error }, result.status);
  return json({ following: true });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to follow members." }, 401);
  const parsed = followSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Could not update that follow." }, 400);
  const result = await setFollow(user.id, parsed.data.userId, false);
  if ("error" in result) return json({ error: result.error }, result.status);
  return json({ following: false });
}
