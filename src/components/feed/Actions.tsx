"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function BookmarkButton({
  targetType,
  targetId,
  initial,
}: {
  targetType: "native_post" | "token" | "dev_callout";
  targetId: string;
  initial: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function toggle() {
    setPending(true);
    const response = await fetch("/api/bookmarks", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId }),
    });
    setPending(false);
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toast(body?.error ?? "Bookmark could not be updated.");
      return;
    }
    setSaved(!saved);
    toast(saved ? "Removed bookmark" : "Saved");
  }

  return (
    <button className="btn" type="button" onClick={toggle} disabled={pending} aria-pressed={saved}>
      {saved ? "Bookmarked" : "Bookmark"}
    </button>
  );
}

export function ShareButton({ path, label = "Share" }: { path: string; label?: string }) {
  const toast = useToast();
  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    toast("Link copied");
  }
  return (
    <button className="btn" type="button" onClick={share}>
      {label}
    </button>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const toast = useToast();
  return (
    <button
      className="btn"
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        toast("Copied");
      }}
    >
      {label}
    </button>
  );
}

export function FollowButton({ userId, initial }: { userId: string; initial: boolean }) {
  const [following, setFollowing] = useState(initial);
  const [pending, setPending] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function toggle() {
    setPending(true);
    const response = await fetch("/api/follows", {
      method: following ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setPending(false);
    if (response.status === 401) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      toast(body?.error ?? "Could not update follow.");
      return;
    }
    setFollowing(!following);
  }

  return (
    <button className={following ? "btn" : "btn btn-primary"} type="button" onClick={toggle} disabled={pending}>
      {following ? "Following" : "Follow"}
    </button>
  );
}
