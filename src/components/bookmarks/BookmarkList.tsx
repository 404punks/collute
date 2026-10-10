"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUsd, formatUtc, shortAddress } from "@/lib/format";

type Item = {
  id: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  snapshot: unknown;
};

export function BookmarkList({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState(initial);
  const router = useRouter();

  async function remove(item: Item) {
    const response = await fetch("/api/bookmarks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: item.targetType, targetId: item.targetId }),
    });
    if (response.ok) {
      setItems((current) => current.filter((row) => row.id !== item.id));
      router.refresh();
    }
  }

  if (items.length === 0) {
    return <p className="lede px-4">Nothing saved yet. Bookmarks live in your Callout Social account.</p>;
  }

  return (
    <div>
      {items.map((item) => {
        const snapshot = item.snapshot as {
          body?: string;
          name?: string | null;
          symbol?: string | null;
          mint?: string;
          usdMarketCap?: number | null;
        };
        const title =
          item.targetType === "native_post"
            ? snapshot.body
            : item.targetType === "token"
              ? `${snapshot.name ?? "Token"} · ${snapshot.symbol ?? ""}`
              : snapshot.body;
        const href =
          item.targetType === "native_post"
            ? `/post/${item.targetId}`
            : item.targetType === "token"
              ? `/token/${item.targetId}`
              : `/post/${item.targetId}`;
        return (
          <article key={item.id} className="post">
            <div className="row">
              <span className="badge">{item.targetType === "token" ? "Token" : item.targetType === "dev_callout" ? "Sample" : "Post"}</span>
              <time className="faint text-sm" dateTime={item.createdAt}>
                Saved {formatUtc(item.createdAt)}
              </time>
            </div>
            <Link href={href} className="mt-2 block font-medium">
              {title}
            </Link>
            {item.targetType === "token" && snapshot.mint ? (
              <p className="faint mt-1 text-sm">
                {shortAddress(snapshot.mint)} · saved snapshot, not a live quote
                {typeof snapshot.usdMarketCap === "number" ? ` · ${formatUsd(snapshot.usdMarketCap)} at save time` : ""}
              </p>
            ) : null}
            <button className="btn mt-3" type="button" onClick={() => remove(item)}>
              Remove
            </button>
          </article>
        );
      })}
    </div>
  );
}
