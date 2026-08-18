import { Skeleton } from "@/components/ui/skeleton";

export default function LimbsLoading() {
  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <div className="mb-4">
        <Skeleton className="mb-2 h-4 w-28" />
        <Skeleton className="h-10 w-full sm:w-64 rounded-md" />
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-8 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
