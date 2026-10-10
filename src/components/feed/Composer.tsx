"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PublicUser } from "@/lib/social/dto";

export function Composer({ user }: { user: PublicUser | null }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [mint, setMint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) {
    return (
      <section className="composer">
        <p className="m-0">
          <Link href="/login" className="font-semibold text-[var(--accent)]">
            Sign in
          </Link>{" "}
          to write a Callout Social post. It will not be published to Pump.fun.
        </p>
      </section>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, mint: mint.trim() || undefined }),
    });
    setPending(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Post could not be saved.");
      return;
    }
    setBody("");
    setMint("");
    router.refresh();
  }

  return (
    <form className="composer" onSubmit={submit}>
      <label className="label" htmlFor="post-body">
        Post on Callout Social
      </label>
      <textarea
        id="post-body"
        className="textarea mt-2"
        maxLength={500}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Share a note. This stays on Callout Social."
        required
      />
      <label className="label mt-3 block" htmlFor="post-mint">
        Mint address, optional
      </label>
      <input
        id="post-mint"
        className="field mt-2"
        value={mint}
        onChange={(event) => setMint(event.target.value)}
        placeholder="Paste a mint to link a token page"
        spellCheck={false}
      />
      <div className="composer-actions">
        <span className="faint text-sm">{body.length}/500 · Not sent to Pump.fun</span>
        <button className="btn btn-primary" type="submit" disabled={pending || body.trim().length === 0}>
          {pending ? "Posting" : "Post"}
        </button>
      </div>
      {error ? <p className="error-text mt-2">{error}</p> : null}
    </form>
  );
}
