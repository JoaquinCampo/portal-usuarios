import { CardSkeleton } from "./card-skeleton";

interface SkeletonGridProps {
  count?: number;
}

export function SkeletonGrid({ count = 6 }: SkeletonGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Loading...</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
