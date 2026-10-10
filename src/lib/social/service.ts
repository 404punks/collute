import "server-only";
import type { NativePost, User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { findMockCallout, findMockToken } from "@/lib/pumpfun/mock";
import { currentDataMode } from "@/lib/pumpfun/policy";
import { fetchCoinFromPump } from "@/lib/pumpfun/client";
import type { NormalizedToken } from "@/lib/pumpfun/types";
import { toPublicUser, type PostDTO } from "./dto";

const PAGE = 10;

type PostWithAuthor = NativePost & { author: User };

function encodeCursor(post: { createdAt: Date; id: string }) {
  return `${post.createdAt.toISOString()}_${post.id}`;
}

function decodeCursor(cursor: string | null) {
  if (!cursor) return null;
  const index = cursor.lastIndexOf("_");
  if (index <= 0) return null;
  const createdAt = new Date(cursor.slice(0, index));
  const id = cursor.slice(index + 1);
  if (Number.isNaN(createdAt.getTime()) || !id) return null;
  return { createdAt, id };
}

export function toPostDTO(post: PostWithAuthor, bookmarked: boolean): PostDTO {
  return {
    id: post.id,
    body: post.body,
    mint: post.mint,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName: post.author.displayName,
      avatarColor: post.author.avatarColor,
    },
    bookmarked,
    source: "callout-social",
  };
}

async function bookmarkSet(userId: string | null, ids: string[]) {
  if (!userId || ids.length === 0) return new Set<string>();
  const rows = await prisma.bookmark.findMany({
    where: { userId, targetType: "native_post", targetId: { in: ids } },
    select: { targetId: true },
  });
  return new Set(rows.map((row) => row.targetId));
}

export async function listPosts(options: {
  cursor?: string | null;
  authorId?: string;
  authorIds?: string[];
  mint?: string;
  viewerId?: string | null;
  limit?: number;
}) {
  const limit = options.limit ?? PAGE;
  const cursor = decodeCursor(options.cursor ?? null);
  const posts = await prisma.nativePost.findMany({
    where: {
      ...(options.authorId ? { authorId: options.authorId } : {}),
      ...(options.authorIds ? { authorId: { in: options.authorIds } } : {}),
      ...(options.mint ? { mint: options.mint } : {}),
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    include: { author: true },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });
  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const marked = await bookmarkSet(
    options.viewerId ?? null,
    page.map((post) => post.id),
  );
  return {
    posts: page.map((post) => toPostDTO(post, marked.has(post.id))),
    nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
  };
}

export async function getPost(id: string, viewerId: string | null) {
  const post = await prisma.nativePost.findUnique({ where: { id }, include: { author: true } });
  if (!post) return null;
  const marked = await bookmarkSet(viewerId, [post.id]);
  return toPostDTO(post, marked.has(post.id));
}

export async function createPost(authorId: string, body: string, mint?: string) {
  const post = await prisma.nativePost.create({
    data: { authorId, body, mint: mint ?? null },
    include: { author: true },
  });
  return toPostDTO(post, false);
}

async function tokenSnapshot(mint: string): Promise<NormalizedToken> {
  const mode = currentDataMode();
  if (mode === "development-mock") {
    const mock = findMockToken(mint);
    if (mock) return mock;
  }
  return fetchCoinFromPump(mint);
}

export async function createBookmark(userId: string, targetType: "native_post" | "token" | "dev_callout", targetId: string) {
  let snapshot: unknown;
  if (targetType === "native_post") {
    const post = await prisma.nativePost.findUnique({ where: { id: targetId }, include: { author: true } });
    if (!post) return { error: "Post not found.", status: 404 as const };
    snapshot = toPostDTO(post, true);
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          type: "bookmark",
          title: "Someone saved your post",
          body: "A Callout Social member bookmarked your post.",
          href: `/post/${post.id}`,
        },
      });
    }
  } else if (targetType === "token") {
    const token = await tokenSnapshot(targetId);
    snapshot = token;
    await prisma.tokenLookup.create({
      data: { userId, mint: token.mint, name: token.name, symbol: token.symbol },
    });
  } else {
    if (currentDataMode() !== "development-mock") {
      return { error: "Sample callouts are only available in development mock mode.", status: 404 as const };
    }
    const callout = findMockCallout(targetId);
    if (!callout) return { error: "Sample callout not found.", status: 404 as const };
    snapshot = callout;
  }

  const row = await prisma.bookmark.upsert({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
    update: { snapshot: JSON.stringify(snapshot) },
    create: { userId, targetType, targetId, snapshot: JSON.stringify(snapshot) },
  });
  return { bookmark: row };
}

export async function deleteBookmark(userId: string, targetType: string, targetId: string) {
  await prisma.bookmark.deleteMany({ where: { userId, targetType, targetId } });
}

export async function listBookmarks(userId: string) {
  const rows = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({
    id: row.id,
    targetType: row.targetType,
    targetId: row.targetId,
    createdAt: row.createdAt.toISOString(),
    snapshot: JSON.parse(row.snapshot) as unknown,
  }));
}

export async function isBookmarked(userId: string | null, targetType: string, targetId: string) {
  if (!userId) return false;
  const row = await prisma.bookmark.findUnique({
    where: { userId_targetType_targetId: { userId, targetType, targetId } },
  });
  return Boolean(row);
}

export async function setFollow(followerId: string, followingId: string, follow: boolean) {
  if (followerId === followingId) return { error: "You cannot follow yourself.", status: 400 as const };
  const target = await prisma.user.findUnique({ where: { id: followingId } });
  if (!target) return { error: "Member not found.", status: 404 as const };
  if (follow) {
    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) {
      await prisma.follow.create({ data: { followerId, followingId } });
      const actor = await prisma.user.findUnique({ where: { id: followerId } });
      await prisma.notification.create({
        data: {
          userId: followingId,
          type: "follow",
          title: "New follower",
          body: `${actor?.displayName ?? "Someone"} followed you on Callout Social.`,
          href: `/profile/${followerId}`,
        },
      });
    }
  } else {
    await prisma.follow.deleteMany({ where: { followerId, followingId } });
  }
  return { following: follow };
}

export async function profileFor(id: string, viewerId: string | null) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { followers: true, following: true, posts: true } } },
  });
  if (!user) return null;
  const following = viewerId
    ? Boolean(
        await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: id } },
        }),
      )
    : false;
  return {
    user: toPublicUser(user, viewerId === user.id),
    counts: user._count,
    following,
    isSelf: viewerId === user.id,
  };
}

export async function searchMembersAndPosts(query: string) {
  const q = query.trim();
  if (q.length < 2 || q.length > 80) return { users: [], posts: [] as PostDTO[] };
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: q.toLowerCase() } },
        { displayName: { contains: q } },
        { walletAddress: q },
      ],
    },
    take: 8,
  });
  const posts = await prisma.nativePost.findMany({
    where: { body: { contains: q } },
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  return {
    users: users.map((user) => toPublicUser(user)),
    posts: posts.map((post) => toPostDTO(post, false)),
  };
}

export async function recordLookup(userId: string | null, token: NormalizedToken) {
  await prisma.tokenLookup.create({
    data: { userId, mint: token.mint, name: token.name, symbol: token.symbol },
  });
}

export async function recentLookups(userId: string | null) {
  if (!userId) return [];
  const rows = await prisma.tokenLookup.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const seen = new Set<string>();
  const unique = [];
  for (const row of rows) {
    if (seen.has(row.mint)) continue;
    seen.add(row.mint);
    unique.push({
      mint: row.mint,
      name: row.name,
      symbol: row.symbol,
      createdAt: row.createdAt.toISOString(),
    });
    if (unique.length === 6) break;
  }
  return unique;
}

export async function popularMembers() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { followers: true } } },
    take: 20,
  });
  return users
    .sort((a, b) => b._count.followers - a._count.followers || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((user) => ({
      ...toPublicUser(user),
      followers: user._count.followers,
    }));
}

export async function notificationsFor(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

export async function unreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function shellData() {
  const { getCurrentUser } = await import("@/lib/auth/session");
  const { pumpStatus, currentDataMode } = await import("@/lib/pumpfun/policy");
  const { mockCallouts } = await import("@/lib/pumpfun/mock");
  const user = await getCurrentUser();
  const mode = currentDataMode();
  return {
    user: user ? toPublicUser(user, true) : null,
    unread: user ? await unreadCount(user.id) : 0,
    members: await popularMembers(),
    recentLookups: await recentLookups(user?.id ?? null),
    status: pumpStatus(mode),
    sampleCallouts: mode === "development-mock" ? mockCallouts : [],
  };
}
