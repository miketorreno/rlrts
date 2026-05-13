import { Button } from "@/components/ui/button";
import { CompleteControls } from "@/components/ui/complete-controls";
import { getCompletionCount } from "@/utils/completion-utils";
import { format } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

// import { Id } from "@server/convex/_generated/dataModel";

import { DayCell } from "./day-cell";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Row view component for displaying leaves in a horizontal twig layout.
 * Shows days in a continuous row with leaf completion tracking.
 * Supports RTL languages and includes gradient fade effects for better UX.
 */

/**
 * Props interface for the MonthRowView component
 */
interface MonthRowViewProps {
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

/**
 * Component that renders leaves in a horizontal twig layout
 * Supports RTL languages and includes gradient fade effects
 */
export function MonthRowView({
  color,
  days,
  completions,
  onToggle,
  onEditLeaf,
  leaves,
  onAddLeaf,
}: MonthRowViewProps) {
  const locale = useLocale();
  const t = useTranslations("twig");
  const [loadingState, setLoadingState] = useState<{
    leafId: Id<"leaves">;
    date: string;
  } | null>(null);
  // Check if current locale is RTL (Hebrew or Arabic)
  const isRTL = ["he", "ar"].includes(locale);

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
    <div className="relative">
      {/* Calendar Header with Day Labels */}
      <div className="relative flex">
        {/* Left/Right spacing for gradient effect */}
        <div
          className={`${isRTL ? "order-first" : "order-first"} w-16 bg-card md:w-32`}
        />
        {/* Gradient fade effect - direction aware */}
        <div
          className={`absolute z-10 h-6 w-12 ${
            isRTL
              ? "right-16 bg-gradient-to-l from-card to-transparent md:right-32"
              : "left-16 bg-gradient-to-r from-card to-transparent md:left-32"
          }`}
        />
        {/* Day name labels (Mo, Tu, We, etc.) */}
        <div className="flex flex-1 gap-px overflow-hidden">
          <div
            className={`flex w-full justify-end gap-px ${isRTL ? "pl-[104px] md:pl-28" : "pr-[104px] md:pr-28"}`}
          >
            {days.map((day) => {
              const date = new Date(day);
              const dayOfWeek = format(date, "eee").toLowerCase();
              // Add separator line for weekends
              const isSaturday = date.getDay() === 6;

              return (
                <div key={day} className="w-6">
                  <div
                    className={`relative h-6 w-6 ${
                      isSaturday
                        ? `${isRTL ? "border-l-2" : "border-r-2"} border-dotted border-primary/20`
                        : ""
                    }`}
                  >
                    <span className="absolute inset-0 flex scale-90 items-center justify-center text-xs font-medium text-foreground text-zinc-600 dark:text-zinc-400">
                      {t(`weekDaysShort.${dayOfWeek}`)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaf Rows Section */}
      <div className="relative space-y-px overflow-hidden">
        {[...leaves]
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((leaf) => {
            // Calculate today's completion count for the leaf
            const today = new Date().toISOString().split("T")[0];
            const todayCount = Array.isArray(completions)
              ? completions.filter(
                  (c) =>
                    c.leafId === leaf._id &&
                    new Date(c.completedAt).toISOString().split("T")[0] ===
                      today,
                ).length
              : 0;

            return (
              <div key={leaf._id} className="relative flex justify-end">
                {/* Calendar view grid for the leaf */}
                <div className="flex-1">
                  <div className="flex justify-end">
                    <div
                      className={`flex gap-px ${isRTL ? "pl-26 md:pl-28" : "pr-26 md:pr-28"}`}
                    >
                      {days.map((date) => (
                        <DayCell
                          key={date}
                          leafId={leaf._id}
                          date={date}
                          count={getCompletionCount(
                            date,
                            leaf._id,
                            completions,
                          )}
                          onCountChange={(newCount) =>
                            handleToggle(leaf._id, date, newCount)
                          }
                          colorClass={color}
                          size="small"
                          isUpdating={
                            loadingState?.leafId === leaf._id &&
                            loadingState?.date === date
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {/* Editable leaf name with hover effects - direction aware */}
                <div
                  className={`absolute flex w-24 cursor-pointer select-none items-start md:w-48 ${isRTL ? "right-0" : "left-0"}`}
                  onClick={() => onEditLeaf(leaf)}
                >
                  <div className="relative flex items-center">
                    <div className="flex items-baseline bg-card">
                      <h3
                        className={`text-base font-medium underline decoration-wavy decoration-2 ${color.replace(
                          "bg-",
                          "decoration-",
                        )}/30 hover:text-muted-foreground hover:no-underline`}
                        onClick={() => onEditLeaf(leaf)}
                      >
                        <span className="cursor-pointer truncate">
                          {leaf.name}
                        </span>
                      </h3>
                      {leaf.timerDuration && (
                        <span
                          className={`${isRTL ? "mx-1" : "ml-1"} text-sm text-muted-foreground/50`}
                        >
                          ({leaf.timerDuration}m)
                        </span>
                      )}
                    </div>
                    {/* Gradient fade effect for leaf name */}
                    <div
                      className={`h-6 w-12 ${isRTL ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-card to-transparent`}
                    />
                  </div>
                </div>
                {/* Leaf completion controls for today */}
                <div className={`absolute ${isRTL ? "left-0" : "right-0"}`}>
                  <CompleteControls
                    count={todayCount}
                    onIncrement={() =>
                      handleToggle(leaf._id, today, todayCount + 1)
                    }
                    onDecrement={() =>
                      handleToggle(leaf._id, today, todayCount - 1)
                    }
                    variant="default"
                    leafId={leaf._id}
                    timerDuration={leaf.timerDuration}
                    leafName={leaf.name}
                    disabled={loadingState?.leafId === leaf._id}
                  />
                </div>
              </div>
            );
          })}
      </div>
      {/* Add new leaf button */}
      <div className={`mt-px flex ${isRTL ? "justify-end" : "justify-end"}`}>
        <Button className="h-[24px] w-24 text-xs" size="sm" onClick={onAddLeaf}>
          {t("controls.new")}
        </Button>
      </div>
    </div>
  );
}
