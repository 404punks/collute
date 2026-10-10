import Link from "next/link";
import { BookmarkButton } from "@/components/feed/Actions";
import { formatUtc, shortAddress } from "@/lib/format";
import type { CalloutPost } from "@/lib/pumpfun/types";

export function SampleCallout({ post, bookmarked }: { post: CalloutPost; bookmarked: boolean }) {
  return (
    <article className="post">
      <div className="row">
        <span className="avatar" style={{ background: "#f5c16c" }}>
          S
        </span>
        <div>
          <div className="row">
            <strong>{post.creatorName}</strong>
            <span className="badge sample">Development sample</span>
          </div>
          <time className="faint text-sm" dateTime={post.createdAt}>
            {formatUtc(post.createdAt)}
          </time>
        </div>
      </div>
      <p className="post-body">{post.body}</p>
      <Link href={`/token/${post.token.mint}`} className="token-chip">
        <span className="token-logo grid place-items-center text-xs font-bold">{post.token.symbol?.slice(0, 1)}</span>
        <span>
          <strong className="block">
            {post.token.name} · {post.token.symbol}
          </strong>
          <span className="mono faint text-sm">{shortAddress(post.token.mint)}</span>
        </span>
      </Link>
      <p className="faint mt-2 text-sm">No Pump.fun post URL. This card is sample data.</p>
      <div className="row mt-3">
        <Link className="btn" href={`/token/${post.token.mint}`}>
          Token page
        </Link>
        <Link className="btn" href={`/post/${post.id}`}>
          Open sample
        </Link>
        <BookmarkButton targetType="dev_callout" targetId={post.id} initial={bookmarked} />
      </div>
    </article>
  );
}
