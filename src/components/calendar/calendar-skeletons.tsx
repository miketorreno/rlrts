import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarSkeletonsProps {
  view?: "monthRow" | "monthGrid";
}

export function YearlyOverviewSkeleton() {
  return (
    <div className="mt-2 flex flex-col items-center sm:mt-4">
      <div className="w-87.5 pb-1 pl-2 sm:w-100 xl:w-246">
        <Skeleton className="h-4 w-48" />
      </div>
      <Card className="mx-auto mb-4 w-fit rounded-xl p-1 shadow-md xl:mb-16 xl:w-246 xl:rounded-3xl xl:p-2">
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-10 w-87.5 sm:h-17.5 sm:w-100 xl:h-35 xl:w-237.5" />
        </div>
      </Card>
    </div>
  );
}

function MonthGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Calendar Title */}
      <div className="flex justify-center">
        <Skeleton className="h-12 w-64" />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((j) => (
          <div key={j} className="space-y-4">
            {/* Month Title */}
            <Skeleton className="h-6 w-32" />
            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array(35)
                .fill(0)
                .map((_, k) => (
                  <Skeleton key={k} className="h-12 w-12" />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthRowSkeleton() {
  return (
    <div className="space-y-4">
      {/* Day Labels Row */}
      <div className="relative flex h-12 items-center">
        <div className="order-first w-16 bg-card md:w-32" />
        <div className="flex flex-1 gap-px overflow-hidden">
          <div className="flex w-full justify-end gap-px">
            <Skeleton className="h-6 w-full" />
          </div>
          <div className="w-28" /> {/* Spacer for right controls */}
        </div>
      </div>

      {/* Three identical rows */}
      <div className="relative space-y-px overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex">
            {/* Habit Name */}
            <div className="absolute left-0 flex w-24 items-start md:w-48">
              <div className="relative flex items-center">
                <Skeleton className="h-6 w-32" />
                <div className="h-6 w-12 bg-linear-to-r from-card to-transparent" />
              </div>
            </div>

            {/* Days - single continuous skeleton */}
            <div className="flex flex-1 pl-32 md:pl-48">
              <div className="flex w-full pr-26 md:pr-28">
                <Skeleton className="h-6 w-full" />
              </div>
            </div>

            {/* Complete Controls */}
            <div className="absolute right-0">
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Add Habit Button */}
      <div className="flex justify-end">
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function CalendarSkeletons({
  view = "monthGrid",
}: CalendarSkeletonsProps) {
  return (
    <Card className="space-y-8 border p-2 shadow-md">
      {/* View Controls Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-10 w-48" />
      </div>

      <div className="flex w-full flex-col gap-8 md:px-8">
        {/* Calendar Skeletons */}
        {[1, 2].map((i) => (
          <div key={i}>
            {view === "monthGrid" ? (
              <MonthGridSkeleton />
            ) : (
              <MonthRowSkeleton />
            )}
          </div>
        ))}
      </div>

      {/* Add Calendar Button Skeleton */}
      <div className="flex justify-center pb-4">
        <Skeleton className="h-10 w-32" />
      </div>
    </Card>
  );
}
