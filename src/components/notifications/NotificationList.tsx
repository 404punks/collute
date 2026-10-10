"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatUtc } from "@/lib/format";

type Note = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationList({ initial }: { initial: Note[] }) {
  const [items, setItems] = useState(initial);
  const router = useRouter();
  const unread = items.some((item) => !item.read);

  async function markRead() {
    const response = await fetch("/api/notifications", { method: "POST" });
    if (!response.ok) return;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    router.refresh();
  }

  if (items.length === 0) {
    return <p className="lede px-4">No notifications yet. Follows and bookmarks on Callout Social show up here.</p>;
  }

  return (
    <div>
      {unread ? (
        <div className="panel">
          <button className="btn" type="button" onClick={markRead}>
            Mark all read
          </button>
        </div>
      ) : null}
      {items.map((item) => (
        <article key={item.id} className="post">
          <div className="row">
            {!item.read ? <span className="badge official">New</span> : null}
            <time className="faint text-sm" dateTime={item.createdAt}>
              {formatUtc(item.createdAt)}
            </time>
          </div>
          <h2 className="mt-2 mb-1 text-base font-semibold">{item.title}</h2>
          <p className="m-0 text-[var(--muted)]">{item.body}</p>
          {item.href ? (
            <Link className="btn mt-3" href={item.href}>
              Open
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
