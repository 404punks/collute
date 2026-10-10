import { getCurrentUser } from "@/lib/auth/session";
import { toPublicUser } from "@/lib/social/dto";
import { unreadCount } from "@/lib/social/service";
import { json } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return json({ user: null, unread: 0 });
  return json({ user: toPublicUser(user, true), unread: await unreadCount(user.id) });
}
