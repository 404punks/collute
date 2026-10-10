import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/feed/Actions";
import { FeedStream } from "@/components/feed/FeedStream";
import { Avatar } from "@/components/ui/Avatar";
import { getCurrentUser } from "@/lib/auth/session";
import { formatUtc, shortAddress } from "@/lib/format";
import { listPosts, profileFor } from "@/lib/social/service";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const profile = await profileFor(id, null);
  return { title: profile?.user.displayName ?? "Profile" };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getCurrentUser();
  const profile = await profileFor(id, viewer?.id ?? null);
  if (!profile) notFound();
  const posts = await listPosts({ authorId: profile.user.id, viewerId: viewer?.id ?? null });

  return (
    <>
      <header className="page-head">
        <div className="flex items-start gap-4">
          <Avatar name={profile.user.displayName} color={profile.user.avatarColor} large />
          <div className="min-w-0 flex-1">
            <div className="row">
              <h1>{profile.user.displayName}</h1>
              <span className="badge native">Callout Social</span>
            </div>
            <p className="lede">@{profile.user.username}</p>
            <p className="mt-2">{profile.user.bio || "No bio yet."}</p>
            <p className="faint mt-2 text-sm">
              Joined {formatUtc(profile.user.createdAt)}
              {profile.user.walletAddress ? ` · ${shortAddress(profile.user.walletAddress)}` : ""}
            </p>
            <p className="mt-2 text-sm">
              <strong>{profile.counts.posts}</strong> posts · <strong>{profile.counts.followers}</strong> followers ·{" "}
              <strong>{profile.counts.following}</strong> following
            </p>
            {!profile.isSelf ? (
              <div className="mt-3">
                <FollowButton userId={profile.user.id} initial={profile.following} />
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {posts.posts.length === 0 ? (
        <p className="lede px-4">No posts yet.</p>
      ) : (
        <FeedStream initialPosts={posts.posts} initialCursor={posts.nextCursor} authorId={profile.user.id} />
      )}
    </>
  );
}
