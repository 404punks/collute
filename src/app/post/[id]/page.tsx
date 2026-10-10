import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SampleCallout } from "@/components/feed/CalloutCards";
import { PostCard } from "@/components/feed/PostCard";
import { getCurrentUser } from "@/lib/auth/session";
import { getCallout } from "@/lib/pumpfun/service";
import { getPost, isBookmarked } from "@/lib/social/service";

export const metadata: Metadata = { title: "Post" };

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const sample = getCallout(id);
  if (sample) {
    const saved = await isBookmarked(user?.id ?? null, "dev_callout", sample.id);
    return <SampleCallout post={sample} bookmarked={saved} />;
  }
  const post = await getPost(id, user?.id ?? null);
  if (!post) notFound();
  return (
    <>
      <header className="page-head">
        <h1>Post</h1>
        <p className="lede">Written on Callout Social. This is not a Pump.fun Callout.</p>
      </header>
      <PostCard post={post} compact={user?.compactFeed} />
    </>
  );
}
