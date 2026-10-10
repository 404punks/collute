import type { Metadata } from "next";
import Link from "next/link";
import { FeedStream } from "@/components/feed/FeedStream";
import { EmptyState } from "@/components/ui/States";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { listPosts } from "@/lib/social/service";
import { pumpStatus, currentDataMode } from "@/lib/pumpfun/policy";

export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage() {
  const user = await getCurrentUser();
  const status = pumpStatus(currentDataMode());
  if (!user) {
    return (
      <EmptyState
        title="Following"
        body="Sign in to see Callout Social posts from members you follow. Pump.fun accounts cannot be followed through a documented API."
        href="/login?next=/following"
        action="Sign in"
      />
    );
  }
  const follows = await prisma.follow.findMany({ where: { followerId: user.id }, select: { followingId: true } });
  const authorIds = follows.map((row) => row.followingId);
  const feed = authorIds.length
    ? await listPosts({ authorIds, viewerId: user.id })
    : { posts: [], nextCursor: null };

  return (
    <>
      <header className="page-head">
        <h1>Following</h1>
        <p className="lede">Callout Social posts from people you follow. {status.callouts.detail}</p>
        <div className="filters">
          <Link className="chip" href="/">
            Latest
          </Link>
          <Link className="chip" href="/following" aria-current="page">
            Following
          </Link>
          <Link className="chip" href="/trending">
            Trending
          </Link>
        </div>
      </header>
      {authorIds.length === 0 ? (
        <EmptyState title="You are not following anyone yet" body="Open a member profile and follow them. Their posts will show up here." href="/search" action="Find members" />
      ) : feed.posts.length === 0 ? (
        <EmptyState title="No posts from people you follow" body="When they write on Callout Social, the notes will appear in this feed." />
      ) : (
        <FeedStream initialPosts={feed.posts} initialCursor={feed.nextCursor} scope="following" compact={user.compactFeed} />
      )}
    </>
  );
}
