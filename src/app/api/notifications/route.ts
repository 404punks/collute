import { getCurrentUser } from "@/lib/auth/session";
import { markNotificationsRead, notificationsFor } from "@/lib/social/service";
import { json } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to see notifications." }, 401);
  return json({ notifications: await notificationsFor(user.id) });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to update notifications." }, 401);
  await markNotificationsRead(user.id);
  return json({ ok: true });
}
