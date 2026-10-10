import type { Metadata } from "next";
import Link from "next/link";
import { CalloutUnavailable, LimitButton } from "@/components/feed/UnavailableNote";
import { Composer } from "@/components/feed/Composer";
import { FeedStream } from "@/components/feed/FeedStream";
import { SampleCallout } from "@/components/feed/CalloutCards";
import { getCurrentUser } from "@/lib/auth/session";
import { getCallouts } from "@/lib/pumpfun/service";
import { currentDataMode, pumpStatus } from "@/lib/pumpfun/policy";
import { toPublicUser } from "@/lib/social/dto";
import { isBookmarked, listPosts } from "@/lib/social/service";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const user = await getCurrentUser();
  const status = pumpStatus(currentDataMode());
  const feed = await listPosts({ viewerId: user?.id ?? null });
  const callouts = getCallouts();
  const saved = await Promise.all(callouts.map((post) => isBookmarked(user?.id ?? null, "dev_callout", post.id)));

  return (
    <>
      <header className="page-head">
        <h1>Live feed</h1>
        <p className="lede">Latest Pump.fun Callouts when an official API provides them, plus posts written on Callout Social.</p>
        <div className="filters" aria-label="Feed filters">
          <Link className="chip" href="/" aria-current="page">
            Latest
          </Link>
          <Link className="chip" href="/following">
            Following
          </Link>
          <Link className="chip" href="/trending">
            Trending
          </Link>
          <LimitButton title="Most discussed" detail={status.discussed.detail} />
          <LimitButton title="Launches" detail={status.launches.detail} />
        </div>
      </header>
      {status.mode === "development-mock" ? (
        <p className="banner" role="status">
          Development samples are on. These cards are not Pump.fun Callouts.
        </p>
      ) : (
        <CalloutUnavailable detail={status.callouts.detail} />
      )}
      {callouts.map((post, index) => (
        <SampleCallout key={post.id} post={post} bookmarked={saved[index]} />
      ))}
      <Composer user={user ? toPublicUser(user, true) : null} />
      <div className="page-head">
        <h2 className="m-0 text-base font-semibold">Posts on Callout Social</h2>
      </div>
      {feed.posts.length === 0 ? (
        <p className="lede px-4">No platform posts yet. The first note written here will show up in this list.</p>
      ) : (
        <FeedStream initialPosts={feed.posts} initialCursor={feed.nextCursor} compact={user?.compactFeed} />
      )}
    </>
  );
}
