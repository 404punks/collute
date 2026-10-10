import type { Metadata } from "next";
import { NotificationList } from "@/components/notifications/NotificationList";
import { EmptyState } from "@/components/ui/States";
import { getCurrentUser } from "@/lib/auth/session";
import { notificationsFor } from "@/lib/social/service";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <EmptyState
        title="Notifications"
        body="Sign in to see follows and bookmarks from Callout Social."
        href="/login?next=/notifications"
        action="Sign in"
      />
    );
  }
  const notifications = await notificationsFor(user.id);
  return (
    <>
      <header className="page-head">
        <h1>Notifications</h1>
        <p className="lede">Platform events only. Pump.fun does not publish a documented notification feed for this app.</p>
      </header>
      <NotificationList initial={notifications} />
    </>
  );
}
