import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validators";
import { json } from "@/lib/http";

const colors = ["#3DFF8F", "#7DD3FC", "#F9A8D4", "#FDBA74", "#C4B5FD"];

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request, "register"), 8, 60 * 60 * 1000);
  if (!limit.ok) return json({ error: "Too many registration attempts. Try again later." }, 429);

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Check the form and try again." }, 400);
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: parsed.data.email.toLowerCase() }, { username: parsed.data.username }] },
  });
  if (existing) return json({ error: "That email or username is already in use." }, 409);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
      avatarColor: colors[parsed.data.username.length % colors.length],
    },
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "welcome",
      title: "Welcome to Callout Social",
      body: "Your posts, follows, and bookmarks stay on this site. Pump.fun Callouts appear only from an official API.",
      href: "/explore",
    },
  });
  await createSession(user.id);
  return json({ ok: true });
}
