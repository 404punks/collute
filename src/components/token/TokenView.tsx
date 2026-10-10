import Link from "next/link";
import { BookmarkButton, CopyButton, ShareButton } from "@/components/feed/Actions";
import { PostCard } from "@/components/feed/PostCard";
import { TokenMedia } from "@/components/token/TokenMedia";
import { formatCount, formatUsd, formatUtc, shortAddress } from "@/lib/format";
import { PUMP_PUBLIC_CALLOUTS_PAGE } from "@/lib/pumpfun/endpoints";
import type { NormalizedToken } from "@/lib/pumpfun/types";
import type { PostDTO } from "@/lib/social/dto";

export function TokenView({
  token,
  bookmarked,
  posts,
  showMarketData,
  linkedMember,
}: {
  token: NormalizedToken;
  bookmarked: boolean;
  posts: PostDTO[];
  showMarketData: boolean;
  linkedMember: { id: string; displayName: string; username: string } | null;
}) {
  const sample = token.source === "development-mock";
  return (
    <article>
      <header className="token-hero">
        <div className="row mb-3">
          <span className={sample ? "badge sample" : "badge official"}>
            {sample ? "Development sample" : "coins-v2"}
          </span>
          {token.degraded ? <span className="badge">Cached after a Pump.fun error</span> : null}
          {token.isBanned ? <span className="badge">coins-v2 is_banned=true</span> : null}
        </div>
        <div className="flex gap-4">
          <TokenMedia src={token.imageUri} name={token.name ?? token.symbol ?? "Token"} nsfw={token.nsfw} large />
          <div className="min-w-0">
            <h1>{token.name ?? "Unnamed token"}</h1>
            <p className="lede">{token.symbol ?? "No symbol returned"}</p>
            <p className="mono mt-2 text-sm break-all">{token.mint}</p>
          </div>
        </div>
        <div className="token-actions mt-4">
          <CopyButton value={token.mint} label="Copy mint" />
          <ShareButton path={`/token/${token.mint}`} label="Share" />
          <BookmarkButton targetType="token" targetId={token.mint} initial={bookmarked} />
          <Link className="btn" href={`/token/${token.mint}?refresh=1`}>
            Refresh
          </Link>
          <a className="btn" href={token.publicPageUrl} target="_blank" rel="noreferrer">
            Pump.fun page
          </a>
        </div>
        <p className="faint mt-2 text-xs">
          The Pump.fun link is built from the mint ({token.publicPageUrlOrigin}). coins-v2 does not return that URL.
          {token.imageSource === "metadata-uri" || token.descriptionSource === "metadata-uri"
            ? " Some missing text or the image was filled from the metadata URI coins-v2 returned."
            : ""}
        </p>
      </header>

      <section className="panel">
        <h2 className="m-0 text-base font-semibold">Description</h2>
        <p className="lede">{token.description ?? "coins-v2 did not return a description."}</p>
        {token.descriptionSource ? <p className="faint text-xs">Source: {token.descriptionSource}</p> : null}
      </section>

      {showMarketData ? (
        <section className="panel">
          <h2 className="m-0 text-base font-semibold">Figures returned for this mint</h2>
          <div className="stats">
            <div className="stat">
              <span>USD market cap</span>
              <b>{token.usdMarketCap === null ? "Not returned" : formatUsd(token.usdMarketCap)}</b>
              <span>usd_market_cap</span>
            </div>
            <div className="stat">
              <span>market_cap raw</span>
              <b className="mono text-sm">{token.marketCapRaw ?? "Not returned"}</b>
              <span>Unit is not defined in the published example, so it is not converted.</span>
            </div>
            <div className="stat">
              <span>Reply count</span>
              <b>{token.replyCount === null ? "Not returned" : formatCount(token.replyCount)}</b>
              <span>reply_count for this coin only</span>
            </div>
            <div className="stat">
              <span>Bonding curve complete</span>
              <b>{token.complete === null ? "Not returned" : token.complete ? "Yes" : "No"}</b>
              <span>complete flag</span>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="faint">Created</dt>
              <dd>{formatUtc(token.createdAt) ?? "Not returned"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="faint">Last trade</dt>
              <dd>{formatUtc(token.lastTradeAt) ?? "Not returned"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="faint">Fetched</dt>
              <dd>{formatUtc(token.fetchedAt)}</dd>
            </div>
          </dl>
        </section>
      ) : (
        <section className="panel">
          <p className="m-0">Market figures are hidden in your display settings.</p>
        </section>
      )}

      <section className="panel">
        <h2 className="m-0 text-base font-semibold">Identity</h2>
        <p className="lede">
          Creator wallet: {token.creator ? <span className="mono">{shortAddress(token.creator, 6, 6)}</span> : "Not returned"}
        </p>
        <p className="faint text-sm">
          coins-v2 does not provide a verified social profile for this wallet. A wallet address is not a safety check,
          audit, or endorsement.
        </p>
        {linkedMember ? (
          <p className="mt-2">
            A Callout Social member linked this public address:{" "}
            <Link href={`/profile/${linkedMember.id}`}>
              {linkedMember.displayName} @{linkedMember.username}
            </Link>
          </p>
        ) : null}
        <div className="row mt-3">
          {token.creator ? <CopyButton value={token.creator} label="Copy creator" /> : null}
          {token.twitter ? (
            <a className="btn" href={token.twitter} target="_blank" rel="noreferrer">
              Twitter link
            </a>
          ) : null}
          {token.website ? (
            <a className="btn" href={token.website} target="_blank" rel="noreferrer">
              Website
            </a>
          ) : null}
          {token.metadataUri ? (
            <a className="btn" href={token.metadataUri} target="_blank" rel="noreferrer">
              Metadata URI
            </a>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <h2 className="m-0 text-base font-semibold">Curve fields</h2>
        <dl className="mt-3 grid gap-2 text-sm">
          {[
            ["Bonding curve", token.bondingCurve],
            ["Associated bonding curve", token.associatedBondingCurve],
            ["Pump swap pool", token.pumpSwapPool],
            ["Raydium pool", token.raydiumPool],
            ["Program", token.program],
            ["Virtual SOL reserves", token.virtualSolReserves],
            ["Virtual token reserves", token.virtualTokenReserves],
            [`Total supply (${token.totalSupplyField})`, token.totalSupply],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <dt className="faint">{label}</dt>
              <dd className="mono text-right break-all">{value ?? "Not returned"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel">
        <h2 className="m-0 text-base font-semibold">Callouts for this token</h2>
        <p className="lede">
          No documented API lists Callout posts for a mint. This page will not invent that history.
        </p>
        <a className="btn mt-2" href={PUMP_PUBLIC_CALLOUTS_PAGE} target="_blank" rel="noreferrer">
          Browse callouts on Pump.fun
        </a>
      </section>

      <section>
        <div className="page-head">
          <h2 className="m-0 text-base font-semibold">Callout Social posts mentioning this mint</h2>
        </div>
        {posts.length === 0 ? (
          <p className="lede px-4">No platform posts link this mint yet.</p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </section>
    </article>
  );
}
