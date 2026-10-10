"use client";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="page-head" role="alert">
      <h1>Something went wrong</h1>
      <p className="lede">This page could not be loaded. Try again in a moment.</p>
      <button className="btn mt-3" type="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
