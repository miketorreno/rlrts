import { Button } from "@/components/ui/button";
import { CompleteControls } from "@/components/ui/complete-controls";
import { useMobile } from "@/hooks/use-mobile";
import { getCompletionCount } from "@/utils/completion-utils";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

// import { Id } from "@server/convex/_generated/dataModel";

import { DayCell } from "./day-cell";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Grid view component for displaying leaves in a traditional twig layout.
 * Shows multiple months with day cells arranged in a 7-column grid.
 * Supports leaf completion tracking and mobile-responsive layout.
 */

/**
 * Props interface for the MonthGridView component
 */
interface MonthGridViewProps {
  /** Primary leaf for the twig */
  leaf: {
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
    position?: number;
  };
  /** Color theme for the twig */
  color: string;
  /** Array of dates to display */
  days: string[];
  /** Array of leaf completion records */
  completions: Array<{
    leafId: Id<"leaves">;
    completedAt: number;
  }>;
  /** Callback for toggling leaf completion */
  onToggle: (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => Promise<void>;
  /** Callback for editing leaf properties */
  onEditLeaf: (leaf: {
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  }) => void;
  /** Array of all leaves in the twig */
  leaves: Array<{
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
    position?: number;
  }>;
  /** Callback for adding a new leaf */
  onAddLeaf: () => void;
}

export function MonthGridView({
  color,
  days,
  completions,
  onToggle,
  onEditLeaf,
  leaves,
  onAddLeaf,
}: MonthGridViewProps) {
  const t = useTranslations("twig");
  const [loadingState, setLoadingState] = useState<{
    leafId: Id<"leaves">;
    date: string;
  } | null>(null);

  const handleToggle = async (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => {
    setLoadingState({ leafId, date });
    try {
      await onToggle(leafId, date, count);
    } finally {
      setLoadingState(null);
    }
  };

  return (
    <div className="space-y-4">
      {[...leaves]
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((leaf) => {
          // Calculate today's completion count for the leaf
          const today = new Date().toISOString().split("T")[0];
          const todayCount = Array.isArray(completions)
            ? completions.filter(
                (c) =>
                  c.leafId === leaf._id &&
                  new Date(c.completedAt).toISOString().split("T")[0] === today,
              ).length
            : 0;

          return (
            <div key={leaf._id}>
              {/* Leaf header with name and timer duration */}
              <div className="flex justify-center pt-8">
                <div className="flex items-baseline pb-2">
                  <div
                    className="cursor-pointer"
                    onClick={() => onEditLeaf(leaf)}
                  >
                    <h3
                      className={`select-none text-2xl font-medium underline decoration-wavy decoration-2 ${color.replace(
                        "bg-",
                        "decoration-",
                      )}/30 hover:text-muted-foreground hover:no-underline`}
                    >
                      {leaf.name}
                    </h3>
                  </div>
                  {leaf.timerDuration && (
                    <span className="ml-1 text-sm text-muted-foreground">
                      ({leaf.timerDuration}m)
                    </span>
                  )}
                </div>
              </div>
              {/* Today's completion controls */}
              <div className="flex justify-center pb-4">
                <CompleteControls
                  count={todayCount}
                  onIncrement={() =>
                    handleToggle(leaf._id, today, todayCount + 1)
                  }
                  onDecrement={() =>
                    handleToggle(leaf._id, today, todayCount - 1)
                  }
                  leafId={leaf._id}
                  variant="default"
                  timerDuration={leaf.timerDuration}
                  leafName={leaf.name}
                  disabled={loadingState?.leafId === leaf._id}
                />
              </div>
              {/* Monthly twig grid */}
              <MonthGridTwig
                leaf={leaf}
                color={color}
                days={days}
                completions={completions}
                onToggle={handleToggle}
                loadingState={loadingState}
              />
            </div>
          );
        })}
      {/* Add leaf button */}
      <div className="flex justify-center pb-8">
        <Button variant="outline" size="sm" onClick={onAddLeaf}>
          <PlusCircle className="h-4 w-4" />
          {t("controls.addLeaf")}
        </Button>
      </div>
    </div>
  );
}

/**
 * Props interface for the MonthGridTwig subcomponent
 */
interface MonthGridTwigProps {
  /** Leaf to display in the twig */
  leaf: {
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  };
  /** Color theme for the twig */
  color: string;
  /** Array of dates to display */
  days: string[];
  /** Array of leaf completion records */
  completions: Array<{
    leafId: Id<"leaves">;
    completedAt: number;
  }>;
  /** Callback for toggling leaf completion */
  onToggle: (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => Promise<void>;
  loadingState: { leafId: Id<"leaves">; date: string } | null;
}

/**
 * Subcomponent that renders the actual twig grid for a leaf
 * Handles month calculation, day padding, and responsive layout
 */
function MonthGridTwig({
  leaf,
  color,
  days,
  completions,
  onToggle,
  loadingState,
}: MonthGridTwigProps) {
  const isMobile = useMobile();
  const t = useTranslations("twig");

  // Calculate months to display based on the most recent date
  const mostRecentDate = new Date(
    Math.max(...days.map((d) => new Date(d).getTime())),
  );
  const months: Record<string, string[]> = {};
  const monthsToShow = isMobile ? 1 : 3;

  // Generate month data for display
  for (let i = 0; i < monthsToShow; i++) {
    const currentDate = new Date(
      mostRecentDate.getFullYear(),
      mostRecentDate.getMonth() - i,
      1,
    );
    const monthKey = format(currentDate, "yyyy-MM");
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    ).getDate();

    // Create array of dates for the month
    months[monthKey] = Array.from({ length: daysInMonth }, (_, j) => {
      const day = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        j + 1,
      );
      return format(day, "yyyy-MM-dd");
    });
  }

  const sortedMonths = Object.entries(months).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <div
      data-leaf-id={leaf._id}
      className="w-full space-y-8 md:grid md:grid-cols-2 md:gap-8 md:space-y-0 lg:grid-cols-3"
    >
      {sortedMonths.map(([monthKey, monthDays]) => {
        // Calculate padding days for proper grid alignment
        const firstDay = new Date(monthDays[0]);
        const lastDay = new Date(monthDays[monthDays.length - 1]);
        const startPadding = firstDay.getDay();
        const endPadding = 6 - lastDay.getDay();
        const emptyStartDays = Array(startPadding).fill(null);
        const emptyEndDays = Array(endPadding).fill(null);

        // Get localized day and month names
        const dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map(
          (d) => t(`weekDays.${d}`),
        );
        const monthName = t(
          `monthNames.${format(firstDay, "MMMM").toLowerCase()}`,
        );
        const year = format(firstDay, "yyyy");

        return (
          <div key={monthKey} className="mx-auto w-fit space-y-4">
            {/* Month and year header */}
            <h3 className="font-medium">{`${monthName} ${year}`}</h3>
            {/* Twig grid */}
            <div className="grid grid-cols-7 gap-px">
              {/* Day name labels */}
              {dayLabels.map((label) => (
                <div
                  key={label}
                  className="text-center text-sm text-muted-foreground"
                >
                  {label}
                </div>
              ))}
              {/* Empty cells for start padding */}
              {emptyStartDays.map((_, index) => (
                <div
                  key={`empty-start-${index}`}
                  className="h-[48px] w-[48px] p-0"
                >
                  <div className="h-full w-full" />
                </div>
              ))}
              {/* Day cells with completion tracking */}
              {monthDays.map((dateStr) => {
                const isInRange = days.includes(dateStr);
                const count = isInRange
                  ? getCompletionCount(dateStr, leaf._id, completions)
                  : 0;

                return (
                  <div key={dateStr} className="h-[48px] w-[48px] p-0">
                    <div className="h-full w-full">
                      <DayCell
                        leafId={leaf._id}
                        date={dateStr}
                        count={count}
                        onCountChange={(newCount) =>
                          onToggle(leaf._id, dateStr, newCount)
                        }
                        colorClass={color}
                        size="large"
                        disabled={!isInRange}
                        isUpdating={
                          loadingState?.leafId === leaf._id &&
                          loadingState?.date === dateStr
                        }
                      />
                    </div>
                  </div>
                );
              })}
              {/* Empty cells for end padding */}
              {emptyEndDays.map((_, index) => (
                <div
                  key={`empty-end-${index}`}
                  className="h-[48px] w-[48px] p-0"
                >
                  <div className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
