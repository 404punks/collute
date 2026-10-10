import type { Metadata } from "next";
import Link from "next/link";
import { currentDataMode, pumpStatus } from "@/lib/pumpfun/policy";
import { getCurrentUser } from "@/lib/auth/session";
import { recentLookups } from "@/lib/social/service";
import { shortAddress } from "@/lib/format";

export const metadata: Metadata = { title: "Trending" };

export default async function TrendingPage() {
  const status = pumpStatus(currentDataMode());
  const user = await getCurrentUser();
  const recent = await recentLookups(user?.id ?? null);

  return (
    <>
      <header className="page-head">
        <h1>Trending</h1>
        <p className="lede">{status.trending.detail}</p>
      </header>
      <section className="panel">
        <h2 className="m-0 text-base font-semibold">What this page will not do</h2>
        <p className="lede">
          It will not rank tokens by volume, holders, or replies. Those rankings are not available from a documented Pump.fun endpoint.
        </p>
        <Link className="btn btn-primary mt-3" href="/explore">
          Look up a mint instead
        </Link>
      </section>
      <section>
        <div className="page-head">
          <h2 className="m-0 text-base font-semibold">Mints you opened</h2>
          <p className="lede">Your own lookup history on Callout Social. Not a trending list.</p>
        </div>
        {recent.length === 0 ? <p className="lede px-4">Nothing here until you open a token page while signed in.</p> : null}
        {recent.map((item) => (
          <Link key={item.mint} href={`/token/${item.mint}`} className="search-hit px-4">
            <span>
              {item.symbol || item.name || "Token"}
              <span className="mono faint"> {shortAddress(item.mint)}</span>
            </span>
          </Link>
        ))}
      </section>
    </>
  );
}
