import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { BookmarkButton, ShareButton } from "@/components/feed/Actions";
import { formatUtc, shortAddress } from "@/lib/format";
import type { PostDTO } from "@/lib/social/dto";

export function PostCard({ post, compact = false }: { post: PostDTO; compact?: boolean }) {
  return (
    <article className={compact ? "post compact" : "post"}>
      <div className="post-top">
        <Avatar name={post.author.displayName} color={post.author.avatarColor} />
        <div className="min-w-0 flex-1">
          <div className="row">
            <Link href={`/profile/${post.author.id}`} className="font-semibold">
              {post.author.displayName}
            </Link>
            <span className="faint">@{post.author.username}</span>
            <span className="badge native">Callout Social</span>
          </div>
          <time className="faint text-sm" dateTime={post.createdAt}>
            {formatUtc(post.createdAt)}
          </time>
          <Link href={`/post/${post.id}`} className="block">
            <p className="post-body">{post.body}</p>
          </Link>
          {post.mint ? (
            <Link href={`/token/${post.mint}`} className="token-chip">
              <span className="token-logo grid place-items-center text-xs font-bold">Mint</span>
              <span className="min-w-0">
                <strong className="block">Linked token</strong>
                <span className="mono faint text-sm">{shortAddress(post.mint, 6, 6)}</span>
              </span>
            </Link>
          ) : null}
          <div className="row mt-3">
            <Link className="btn" href={`/post/${post.id}`}>
              Open
            </Link>
            <ShareButton path={`/post/${post.id}`} />
            <BookmarkButton targetType="native_post" targetId={post.id} initial={post.bookmarked} />
          </div>
        </div>
      </div>
    </article>
  );
}
