"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

interface TwigLeavesListProps {
  leaves:
    | Array<{
        _id: Id<"leaves">;
        name: string;
      }>
    | undefined;
}

export function TwigLeavesList({ leaves }: TwigLeavesListProps) {
  const router = useRouter();

  return (
    <Card className="mx-auto my-8 max-w-xl border p-2 shadow-md">
      <div className="p-4">
        <h2 className="mb-6 text-lg font-semibold">Associated Leaves</h2>
        <div className="space-y-2">
          {leaves?.map((leaf) => (
            <div
              key={leaf._id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span>{leaf.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/leaves/${leaf._id}`)}
              >
                View Details
              </Button>
            </div>
          ))}
          {leaves?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No leaves in this twig yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
