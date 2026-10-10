"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { NavLinks } from "@/components/shell/NavLinks";
import { brand } from "@/lib/brand";
import { PUMP_PUBLIC_CALLOUTS_PAGE } from "@/lib/pumpfun/endpoints";
import type { PublicUser } from "@/lib/social/dto";
import type { PumpStatus } from "@/lib/pumpfun/types";

export type RailMember = PublicUser & { followers: number };
export type RailLookup = { mint: string; name: string | null; symbol: string | null; createdAt: string };

export function Shell({
  user,
  unread,
  members,
  recentLookups,
  status,
  children,
}: {
  user: PublicUser | null;
  unread: number;
  members: RailMember[];
  recentLookups: RailLookup[];
  status: PumpStatus;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (event.key === "/" && !typing) {
        event.preventDefault();
        router.push("/search");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
  const mobile = [
    { href: "/", label: "Home", icon: "home" as const },
    { href: "/explore", label: "Explore tokens", icon: "explore" as const },
    { href: "/bookmarks", label: "Bookmarks", icon: "bookmarks" as const },
    { href: "/notifications", label: "Notifications", icon: "notifications" as const },
    { href: user ? `/profile/${user.id}` : "/login", label: "Profile", icon: "profile" as const },
  ];

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="shell">
        <aside className="sidebar flex flex-col">
          <Link href="/" className="brand">
            <Logo />
            <span className="brand-copy">
              <strong>{brand.name}</strong>
              <span>{brand.tagline}</span>
            </span>
          </Link>
          <NavLinks unread={unread} />
          <Link className="btn btn-primary discover" href="/explore">
            <Icon name="explore" />
            <span>Discover Tokens</span>
          </Link>
          <div className="mt-auto">
            {user ? (
              <Link href={`/profile/${user.id}`} className="user-chip">
                <Avatar name={user.displayName} color={user.avatarColor} />
                <span className="user-copy min-w-0">
                  <strong className="block truncate">{user.displayName}</strong>
                  <span className="faint text-sm">@{user.username}</span>
                </span>
              </Link>
            ) : (
              <Link href="/login" className="btn btn-block">
                Sign in
              </Link>
            )}
            <p className="sidebar-note">Not affiliated with Pump.fun. Official coin data only.</p>
          </div>
        </aside>
        <div className="center">
          <header className="mobile-top">
            <button className="btn" type="button" onClick={() => setOpen(true)} aria-label="Open menu">
              Menu
            </button>
            <Link href="/" className="inline-flex items-center gap-2 font-semibold">
              <Logo className="h-7 w-7" />
              {brand.shortName}
            </Link>
            <Link href="/search" className="btn" aria-label="Search">
              <Icon name="search" />
            </Link>
          </header>
          <div id="main">{children}</div>
        </div>
        <aside className="rail" aria-label="Discovery">
          <form className="rail-card" action="/search">
            <label className="label" htmlFor="rail-search">
              Token search
            </label>
            <div className="mt-2 flex gap-2">
              <input id="rail-search" className="field" name="q" placeholder="Mint address" />
              <button className="btn" type="submit">
                Go
              </button>
            </div>
            <p className="mt-2">{status.nameSearch.detail}</p>
          </form>
          <section className="rail-card">
            <h2>Trending tokens</h2>
            <p>{status.trending.detail}</p>
          </section>
          <section className="rail-card">
            <h2>Recently active Callouts</h2>
            <p>{status.callouts.detail}</p>
            <a className="btn mt-3" href={PUMP_PUBLIC_CALLOUTS_PAGE} target="_blank" rel="noreferrer">
              Open Pump.fun callouts
            </a>
          </section>
          <section className="rail-card">
            <h2>Popular on Callout Social</h2>
            <p>Members ranked by follows on this site. Not Pump.fun creators.</p>
            <div className="rail-list">
              {members.length === 0 ? <p>No members yet.</p> : null}
              {members.map((member) => (
                <Link key={member.id} href={`/profile/${member.id}`}>
                  <span className="truncate">
                    {member.displayName}
                    <span className="faint"> @{member.username}</span>
                  </span>
                  <span className="faint">{member.followers}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="rail-card">
            <h2>Recently opened</h2>
            <p>Mints you looked up here. This is not a market ranking.</p>
            <div className="rail-list">
              {recentLookups.length === 0 ? <p>Look up a mint to build this list.</p> : null}
              {recentLookups.map((item) => (
                <Link key={item.mint} href={`/token/${item.mint}`}>
                  <span className="truncate">{item.symbol || item.name || "Token"}</span>
                  <span className="mono faint text-xs">{item.mint.slice(0, 4)}</span>
                </Link>
              ))}
            </div>
          </section>
          <section className="rail-card">
            <h2>Market overview</h2>
            <p>No documented endpoint provides a market-wide snapshot, so this panel stays empty rather than estimating one.</p>
          </section>
        </aside>
      </div>
      <nav className="mobile-nav" aria-label="Mobile">
        {mobile.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-label={item.label}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            <Icon name={item.icon} />
          </Link>
        ))}
      </nav>
      {open ? (
        <div className="drawer" role="presentation" onClick={() => setOpen(false)}>
          <div
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <strong>{brand.name}</strong>
              <button className="btn" type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <Icon name="close" />
              </button>
            </div>
            <NavLinks unread={unread} onNavigate={() => setOpen(false)} />
            <Link className="btn btn-primary discover" href="/explore" onClick={() => setOpen(false)}>
              Discover Tokens
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
