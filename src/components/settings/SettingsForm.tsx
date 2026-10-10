"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/social/dto";
import { useToast } from "@/components/ui/Toast";

type WalletProvider = {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
};

export function SettingsForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState(user.walletAddress ?? "");
  const [pending, setPending] = useState(false);

  async function connectWallet() {
    const provider = (window as Window & { solana?: WalletProvider }).solana;
    if (!provider?.connect) {
      toast("No Solana wallet was found. Paste a public address instead.");
      return;
    }
    try {
      const result = await provider.connect();
      setWallet(result.publicKey.toString());
      toast("Public address added. Nothing was signed.");
    } catch {
      toast("Wallet connection was cancelled.");
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        bio: form.get("bio"),
        walletAddress: wallet,
        reduceMotion: form.get("reduceMotion") === "on",
        compactFeed: form.get("compactFeed") === "on",
        showMarketData: form.get("showMarketData") === "on",
      }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Settings could not be saved.");
      return;
    }
    toast("Settings saved");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <form className="panel grid gap-3" onSubmit={save}>
      <label className="grid gap-1 text-sm">
        Display name
        <input className="field" name="displayName" defaultValue={user.displayName} required maxLength={40} />
      </label>
      <label className="grid gap-1 text-sm">
        Bio
        <textarea className="textarea" name="bio" defaultValue={user.bio} maxLength={280} />
      </label>
      <label className="grid gap-1 text-sm">
        Public wallet address
        <input className="field mono" value={wallet} onChange={(event) => setWallet(event.target.value)} spellCheck={false} />
      </label>
      <p className="faint text-sm">
        Optional. Callout Social never asks for a seed phrase or private key. Connecting a wallet only reads the public address.
      </p>
      <button className="btn" type="button" onClick={connectWallet}>
        Use browser wallet
      </button>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="showMarketData" defaultChecked={user.showMarketData !== false} />
        Show coins-v2 market figures
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="compactFeed" defaultChecked={user.compactFeed === true} />
        Compact feed
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="reduceMotion" defaultChecked={user.reduceMotion === true} />
        Reduce motion
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <div className="row">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Saving" : "Save"}
        </button>
        <button className="btn" type="button" onClick={logout}>
          Sign out
        </button>
      </div>
    </form>
  );
}
