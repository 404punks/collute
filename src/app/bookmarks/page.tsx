import type { Metadata } from "next";
import { BookmarkList } from "@/components/bookmarks/BookmarkList";
import { EmptyState } from "@/components/ui/States";
import { getCurrentUser } from "@/lib/auth/session";
import { listBookmarks } from "@/lib/social/service";

export const metadata: Metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <EmptyState
        title="Bookmarks"
        body="Sign in to save Callout Social posts and token pages on this site."
        href="/login?next=/bookmarks"
        action="Sign in"
      />
    );
  }
  const bookmarks = await listBookmarks(user.id);
  return (
    <>
      <header className="page-head">
        <h1>Bookmarks</h1>
        <p className="lede">Saved on Callout Social. Token figures in a bookmark are the snapshot from when you saved it.</p>
      </header>
      <BookmarkList initial={bookmarks} />
    </>
  );
}
