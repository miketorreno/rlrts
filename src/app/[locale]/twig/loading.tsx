import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TwigLoading() {
  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <Card className="space-y-8 border p-2 shadow-md">
        {/* View Controls Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="flex w-full flex-col gap-8 md:px-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-6">
              {/* Twig Title */}
              <div className="flex justify-center">
                <Skeleton className="h-12 w-64" />
              </div>

              {/* Month grid: 7 columns × 5 rows */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 35 }).map((_, k) => (
                  <Skeleton key={k} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Twig Button Skeleton */}
        <div className="flex justify-center pb-4">
          <Skeleton className="h-10 w-32" />
        </div>
      </Card>
    </div>
  );
}
