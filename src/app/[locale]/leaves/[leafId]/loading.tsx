import { Skeleton } from "@/components/ui/skeleton";

export default function LeafDetailLoading() {
  return (
    <div className="container mx-auto max-w-7xl">
      {/* Back button skeleton */}
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Main content skeleton */}
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col items-center">
          <Skeleton className="mb-8 h-8 w-48" />
          <Skeleton className="mb-8 h-[150px] w-[600px]" />
        </div>
      </div>

      {/* Form skeleton */}
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
