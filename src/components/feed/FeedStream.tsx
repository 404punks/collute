"use client";

import { useEffect, useState } from "react";
import { PostCard } from "@/components/feed/PostCard";
import type { PostDTO } from "@/lib/social/dto";

export function FeedStream({
  initialPosts,
  initialCursor,
  scope,
  authorId,
  mint,
  compact,
}: {
  initialPosts: PostDTO[];
  initialCursor: string | null;
  scope?: "following";
  authorId?: string;
  mint?: string;
  compact?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
  }, [initialPosts, initialCursor]);

  async function loadMore() {
    if (!cursor) return;
    setPending(true);
    setError(null);
    const params = new URLSearchParams({ cursor });
    if (scope) params.set("scope", scope);
    if (authorId) params.set("authorId", authorId);
    if (mint) params.set("mint", mint);
    const response = await fetch(`/api/posts?${params.toString()}`);
    setPending(false);
    if (!response.ok) {
      setError("More posts could not be loaded.");
      return;
    }
    const body = (await response.json()) as { posts: PostDTO[]; nextCursor: string | null };
    setPosts((current) => [...current, ...body.posts]);
    setCursor(body.nextCursor);
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} compact={compact} />
      ))}
      {error ? <p className="error-text px-4">{error}</p> : null}
      {cursor ? (
        <div className="panel">
          <button className="btn" type="button" onClick={loadMore} disabled={pending}>
            {pending ? "Loading" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
