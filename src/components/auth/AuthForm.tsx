"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "login"
        ? { email: form.get("email"), password: form.get("password") }
        : {
            email: form.get("email"),
            username: form.get("username"),
            displayName: form.get("displayName"),
            password: form.get("password"),
          };
    setPending(true);
    setError(null);
    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Could not continue.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <section className="page-head">
      <h1>{mode === "login" ? "Sign in" : "Create your profile"}</h1>
      <p className="lede">
        Callout Social accounts are separate from Pump.fun. A wallet is optional and only a public address is stored.
      </p>
      <form className="mt-4 grid gap-3" onSubmit={submit}>
        {mode === "register" ? (
          <>
            <label className="grid gap-1 text-sm">
              Display name
              <input className="field" name="displayName" required maxLength={40} />
            </label>
            <label className="grid gap-1 text-sm">
              Username
              <input className="field" name="username" required minLength={3} maxLength={20} />
            </label>
          </>
        ) : null}
        <label className="grid gap-1 text-sm">
          Email
          <input className="field" name="email" type="email" autoComplete="email" required />
        </label>
        <label className="grid gap-1 text-sm">
          Password
          <input
            className="field"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 8 : undefined}
            required
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Working" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        {mode === "login" ? (
          <Link href={`/register?next=${encodeURIComponent(next)}`}>Need an account?</Link>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Already registered?</Link>
        )}
      </p>
    </section>
  );
}
