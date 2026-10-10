import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashSessionToken, newSessionToken } from "./password";

export const SESSION_COOKIE = "callout_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function createSession(userId: string) {
  const token = newSessionToken();
  const tokenHash = await hashSessionToken(token);
  const expiresAt = new Date(Date.now() + THIRTY_DAYS * 1000);
  await prisma.session.create({ data: { userId, tokenHash, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = await hashSessionToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } });
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const tokenHash = await hashSessionToken(token);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.delete({ where: { id: session.id } });
      return null;
    }
    return session.user;
  } catch (error) {
    console.error("[callout] session lookup failed", error instanceof Error ? error.message : "unknown");
    return null;
  }
}
