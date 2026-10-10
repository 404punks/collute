"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-head" role="alert">
      <h1>Something went wrong</h1>
      <p className="lede">The page could not be loaded. Your session and bookmarks are still stored locally in the app database.</p>
      <button className="btn mt-3" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
