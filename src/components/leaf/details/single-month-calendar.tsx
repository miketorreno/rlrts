"use client";

import { DayCell } from "@/components/calendar/day-cell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBackgroundColorClass } from "@/lib/colors";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

/**
 * SingleMonthCalendar - A calendar component that displays and tracks leaf completions for a single month
 * Features:
 * - Month navigation
 * - Grid layout with day cells
 * - Leaf completion tracking
 * - Optimistic UI updates with loading states
 */

interface SingleMonthCalendarProps {
  leaf: {
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  };
  colorTheme: string; // Theme color for completion indicators
  completions: Array<{
    // Array of leaf completion records
    leafId: Id<"leaves">;
    completedAt: number;
  }>;
  onToggle: (leafId: Id<"leaves">, date: string, count: number) => void; // Callback for toggling completion state
  initialDate?: Date; // Optional starting date, defaults to current date
}

export function SingleMonthCalendar({
  leaf,
  colorTheme,
  completions,
  onToggle,
  initialDate = new Date(),
}: SingleMonthCalendarProps) {
  const t = useTranslations("calendar");
  const [currentDate, setCurrentDate] = useState(initialDate);
  // Track which dates are currently being updated for loading states
  const [updatingDates, setUpdatingDates] = useState<Set<string>>(new Set());

  const goToPreviousMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  // Handle completion toggle with optimistic updates and loading states
  const handleToggle = async (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => {
    setUpdatingDates((prev) => new Set(prev).add(date));
    try {
      await onToggle(leafId, date, count);
    } finally {
      setUpdatingDates((prev) => {
        const next = new Set(prev);
        next.delete(date);
        return next;
      });
    }
  };

  // Generate array of dates for the current month
  const currentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      i + 1,
    );
    return format(day, "yyyy-MM-dd");
  });

  // Calculate valid date range (1 year from today)
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);
  const days = monthDays.filter((d) => {
    const date = new Date(d);
    return date >= start && date <= end;
  });

  // Calculate padding days for proper grid alignment
  const firstDay = new Date(monthDays[0]);
  const lastDay = new Date(monthDays[monthDays.length - 1]);
  const startPadding = firstDay.getDay(); // Number of empty cells before first day
  const endPadding = 6 - lastDay.getDay(); // Number of empty cells after last day
  const emptyStartDays = Array(startPadding).fill(null);
  const emptyEndDays = Array(endPadding).fill(null);

  // Get localized strings for days and month
  const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((d) =>
    t(`weekDays.${d}`),
  );
  const monthName = t(`monthNames.${format(firstDay, "MMMM").toLowerCase()}`);
  const year = format(firstDay, "yyyy");

  return (
    <Card className="min-w-[300px] border p-4 shadow-md">
      {/* Month navigation header */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">{`${monthName} ${year}`}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mx-auto w-fit">
        <div className="grid grid-cols-7 gap-[1px]">
          {/* Weekday labels row */}
          {dayLabels.map((label) => (
            <div
              key={label}
              className="text-center text-xs text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {/* Empty cells for start padding */}
          {emptyStartDays.map((_, index) => (
            <div key={`empty-start-${index}`} className="h-9 w-9">
              <div className="h-full w-full" />
            </div>
          ))}
          {/* Calendar day cells */}
          {monthDays.map((dateStr) => {
            const isInRange = days.includes(dateStr);
            const count = getCompletionCount(dateStr, leaf._id, completions);
            return (
              <div key={dateStr} className="h-9 w-9">
                <DayCell
                  leafId={leaf._id}
                  date={dateStr}
                  count={count}
                  onCountChange={async (newCount) =>
                    handleToggle(leaf._id, dateStr, newCount)
                  }
                  colorClass={getBackgroundColorClass(colorTheme, count)}
                  size="medium"
                  disabled={!isInRange}
                  isUpdating={updatingDates.has(dateStr)}
                />
              </div>
            );
          })}
          {/* Empty cells for end padding */}
          {emptyEndDays.map((_, index) => (
            <div key={`empty-end-${index}`} className="h-9 w-9">
              <div className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Calculate the number of times a leaf was completed on a specific date
 * @param date - The date to check in YYYY-MM-DD format
 * @param leafId - The ID of the leaf to check
 * @param completions - Array of all leaf completion records
 * @returns The number of times the leaf was completed on the given date
 */
function getCompletionCount(
  date: string,
  leafId: Id<"leaves">,
  completions:
    | Array<{ leafId: Id<"leaves">; completedAt: number }>
    | null
    | undefined,
): number {
  if (!Array.isArray(completions)) return 0;

  return completions.filter((completion) => {
    const completionDate = new Date(completion.completedAt)
      .toISOString()
      .split("T")[0];
    return completion.leafId === leafId && completionDate === date;
  }).length;
}
