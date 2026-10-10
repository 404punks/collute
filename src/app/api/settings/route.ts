import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { toPublicUser } from "@/lib/social/dto";
import { settingsSchema } from "@/lib/validators";
import { json } from "@/lib/http";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ error: "Sign in to change settings." }, 401);
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? "Check the form." }, 400);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio,
      walletAddress: parsed.data.walletAddress || null,
      reduceMotion: parsed.data.reduceMotion,
      compactFeed: parsed.data.compactFeed,
      showMarketData: parsed.data.showMarketData,
    },
  });
  return json({ user: toPublicUser(updated, true) });
}
