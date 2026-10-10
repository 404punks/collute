import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";
import { json } from "@/lib/http";

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "login"), 10, 10 * 60 * 1000);
  if (!limit.ok) return json({ error: "Too many sign-in attempts. Try again later." }, 429);

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Enter a valid email and password." }, 400);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return json({ error: "Email or password is incorrect." }, 401);
  }
  await createSession(user.id);
  return json({ ok: true });
}
