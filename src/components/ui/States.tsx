import Link from "next/link";

export function EmptyState({
  title,
  body,
  href,
  action,
}: {
  title: string;
  body: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="panel">
      <h2 className="m-0 text-lg font-semibold tracking-tight">{title}</h2>
      <p className="lede">{body}</p>
      {href && action ? (
        <Link className="btn btn-primary mt-3" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function ErrorState({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel" role="alert">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
      <p className="lede">{body}</p>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="panel" aria-hidden="true">
      <div className="skeleton mb-3 h-4 w-40" />
      <div className="skeleton mb-2 h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
    </div>
  );
}
