"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "@/i18n/routing";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

interface CalendarHabitsListProps {
  habits:
    | Array<{
        _id: Id<"habits">;
        name: string;
      }>
    | undefined;
}

export function CalendarHabitsList({ habits }: CalendarHabitsListProps) {
  const router = useRouter();

  return (
    <Card className="mx-auto my-8 max-w-xl border p-2 shadow-md">
      <div className="p-4">
        <h2 className="mb-6 text-lg font-semibold">Associated Habits</h2>
        <div className="space-y-2">
          {habits?.map((habit) => (
            <div
              key={habit._id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span>{habit.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/habits/${habit._id}`)}
              >
                View Details
              </Button>
            </div>
          ))}
          {habits?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No habits in this calendar yet.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
