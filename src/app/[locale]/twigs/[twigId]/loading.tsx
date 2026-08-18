import { Skeleton } from "@/components/ui/skeleton";

export default function TwigDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Title skeleton */}
      <div className="text-center">
        <Skeleton className="mx-auto mb-8 h-8 w-48" />
      </div>

      {/* Leaves list card skeleton */}
      <div className="mx-auto my-8 max-w-xl rounded-xl border p-2 shadow-md">
        <div className="p-4">
          <Skeleton className="mb-6 h-5 w-40" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit form skeleton */}
      <div className="mx-auto max-w-xl p-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
