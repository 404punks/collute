"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PostDTO, PublicUser } from "@/lib/social/dto";
import type { NormalizedToken, PumpStatus } from "@/lib/pumpfun/types";
import { shortAddress } from "@/lib/format";

type Payload = {
  query: string;
  kind: "empty" | "text" | "mint";
  users: PublicUser[];
  posts: PostDTO[];
  token: NormalizedToken | null;
  tokenError: string | null;
  status: PumpStatus;
};

export function SearchScreen({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      setLoading(false);
      if (!response.ok) {
        setError("Search is unavailable right now.");
        return;
      }
      setData((await response.json()) as Payload);
      const url = `/search?q=${encodeURIComponent(trimmed)}`;
      window.history.replaceState(null, "", url);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [query]);

  return (
    <section>
      <header className="page-head">
        <h1>Search</h1>
        <p className="lede">Mint addresses hit coins-v2. Names search Callout Social members and posts.</p>
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            router.replace(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <label className="sr-only" htmlFor="search-q">
            Search
          </label>
          <input
            id="search-q"
            className="field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, @handle, or mint address"
            autoFocus
          />
        </form>
      </header>
      {loading ? <p className="px-4 text-sm text-[var(--muted)]">Searching…</p> : null}
      {error ? <p className="error-text px-4">{error}</p> : null}
      {data?.kind === "text" ? (
        <p className="lede px-4">{data.status.nameSearch.detail}</p>
      ) : null}
      {data?.token ? (
        <Link href={`/token/${data.token.mint}`} className="token-chip mx-4">
          <span className="min-w-0">
            <strong className="block">
              {data.token.name ?? "Token"} · {data.token.symbol ?? "—"}
            </strong>
            <span className="mono faint text-sm">{shortAddress(data.token.mint, 8, 6)}</span>
            <span className="badge official mt-1">{data.token.source}</span>
          </span>
        </Link>
      ) : null}
      {data?.tokenError ? <p className="error-text px-4">{data.tokenError}</p> : null}
      <div className="page-head">
        <h2 className="m-0 text-base font-semibold">Members</h2>
      </div>
      {data && data.users.length === 0 ? <p className="lede px-4">No matching members.</p> : null}
      {data?.users.map((user) => (
        <Link key={user.id} href={`/profile/${user.id}`} className="search-hit px-4">
          <span>
            {user.displayName} <span className="faint">@{user.username}</span>
          </span>
        </Link>
      ))}
      <div className="page-head">
        <h2 className="m-0 text-base font-semibold">Posts</h2>
      </div>
      {data && data.posts.length === 0 ? <p className="lede px-4">No matching Callout Social posts.</p> : null}
      {data?.posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="search-hit block px-4">
          <span className="line-clamp-2">{post.body}</span>
        </Link>
      ))}
      {!query.trim() ? <p className="lede px-4">Start typing. Results update after a short pause.</p> : null}
    </section>
  );
}
