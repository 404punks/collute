import type { Metadata } from "next";
import { currentDataMode, pumpStatus } from "@/lib/pumpfun/policy";
import { officialInterfaces } from "@/lib/pumpfun/endpoints";

export const metadata: Metadata = { title: "Explore tokens" };

export default function ExplorePage() {
  const status = pumpStatus(currentDataMode());
  return (
    <>
      <header className="page-head">
        <h1>Explore tokens</h1>
        <p className="lede">Look up one Pump.fun coin by mint. The documented read API does not offer a directory.</p>
      </header>
      <form className="panel grid gap-3" action="/search">
        <label className="grid gap-1 text-sm" htmlFor="mint">
          Mint address
          <input id="mint" className="field mono" name="q" placeholder="Paste a mint" required spellCheck={false} />
        </label>
        <button className="btn btn-primary" type="submit">
          Look up
        </button>
      </form>
      <section className="panel">
        <h2 className="m-0 text-base font-semibold">What is live</h2>
        <p className="lede">{status.coinLookup.detail}</p>
        <p className="faint text-sm">Documented by {officialInterfaces.coinsV2.documentedBy}</p>
      </section>
      <section className="panel">
        <h2 className="m-0 text-base font-semibold">What is not available</h2>
        <ul className="mt-2 grid gap-2 pl-4 text-sm text-[var(--muted)]">
          <li>{status.launches.detail}</li>
          <li>{status.trending.detail}</li>
          <li>{status.nameSearch.detail}</li>
          <li>{status.streaming.detail}</li>
        </ul>
      </section>
    </>
  );
}
