import { Skeleton } from "@/components/ui/skeleton";

export default function TodosLoading() {
  return (
    <div className="container mx-auto max-w-7xl pt-16">
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Todo row skeletons */}
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
