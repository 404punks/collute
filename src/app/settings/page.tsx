import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { EmptyState } from "@/components/ui/States";
import { getCurrentUser } from "@/lib/auth/session";
import { currentDataMode, pumpStatus } from "@/lib/pumpfun/policy";
import { toPublicUser } from "@/lib/social/dto";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <EmptyState title="Settings" body="Sign in to edit your Callout Social profile." href="/login?next=/settings" action="Sign in" />
    );
  }
  const status = pumpStatus(currentDataMode());
  return (
    <>
      <header className="page-head">
        <h1>Settings</h1>
        <p className="lede">Account and display preferences for Callout Social.</p>
      </header>
      <SettingsForm user={toPublicUser(user, true)} />
      <section className="panel">
        <h2 className="m-0 text-base font-semibold">Data source</h2>
        <p className="lede">Mode: {status.mode}. Coin lookup uses the documented coins-v2 endpoint. Callout posts are {status.callouts.available ? "available" : "not available from an official API"}.</p>
        {process.env.VERCEL ? (
          <p className="lede">
            This deployment stores accounts on the server instance. The demo account is included each time a new instance starts. Accounts created here remain until that instance is replaced.
          </p>
        ) : null}
      </section>
    </>
  );
}
