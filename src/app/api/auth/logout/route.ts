import { destroySession } from "@/lib/auth/session";
import { json } from "@/lib/http";

export async function POST() {
  await destroySession();
  return json({ ok: true });
}
