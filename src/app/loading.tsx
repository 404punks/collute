import { FeedSkeleton } from "@/components/ui/States";

export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="page-head">
        <div className="skeleton h-6 w-36" />
      </div>
      <FeedSkeleton />
      <FeedSkeleton />
    </div>
  );
}
