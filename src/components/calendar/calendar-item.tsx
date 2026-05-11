import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// import { Id } from "@server/convex/_generated/dataModel";

import { MonthGridView } from "./month-grid-view";
import { MonthRowView } from "./month-row-view";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Individual calendar component that displays a single calendar's habits in either grid or row view.
 * Handles the display of calendar name, habits, and their completion states.
 */

/**
 * Type defining the available view modes for calendar display
 */
type CalendarViewType = "monthRow" | "monthGrid";

/**
 * Props interface for the CalendarItem component
 */
interface CalendarItemProps {
  /** Calendar object containing basic calendar information */
  calendar: {
    _id: Id<"calendars">;
    name: string;
    colorTheme: string;
  };
  /** Array of habits associated with this calendar */
  habits: Array<{
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
  }>;
  /** Array of dates to display in the calendar */
  days: string[];
  /** Array of habit completion records */
  completions: Array<{
    habitId: Id<"habits">;
    completedAt: number;
  }>;
  /** Callback to add a new habit to this calendar */
  onAddHabit: () => void;
  /** Callback to edit a specific habit's properties */
  onEditHabit: (habit: {
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
  }) => void;
  /** Callback to toggle habit completion for a specific date */
  onToggleHabit: (
    habitId: Id<"habits">,
    date: string,
    count: number,
  ) => Promise<void>;
  /** Current view mode of the calendar */
  view: CalendarViewType;
}

/**
 * Component that renders an individual calendar with its habits
 * Supports two view modes: month row and month grid
 */
export const CalendarItem = ({
  calendar,
  habits,
  days,
  completions,
  onAddHabit,
  onEditHabit,
  onToggleHabit,
  view,
}: CalendarItemProps) => {
  const t = useTranslations("calendar");
  const router = useRouter();

  // Ensure color theme has proper Tailwind prefix
  const colorTheme = calendar.colorTheme.startsWith("bg-")
    ? calendar.colorTheme
    : `bg-${calendar.colorTheme}-500`;

  return (
    <div className="space-y-8">
      {/* Calendar Header - Displays calendar name with themed underline decoration */}
      <div className="flex justify-center">
        <div
          className="cursor-pointer pt-4"
          onClick={() => router.push(`/calendars/${calendar._id}`)}
        >
          <h2
            className={`select-none text-4xl font-semibold underline decoration-wavy decoration-2 ${colorTheme.replace(
              "bg-",
              "decoration-",
            )}/30 hover:text-muted-foreground hover:no-underline`}
          >
            {calendar.name}
          </h2>
        </div>
      </div>

      {/* Calendar Content - Shows empty state or habits based on view mode */}
      {habits.length === 0 ? (
        // Empty state when no habits exist
        <div className="flex w-full flex-col items-center justify-center space-y-8 pb-16">
          <p className="text-sm text-muted-foreground">
            {t("emptyState.noHabits")}
          </p>
          <Button size="sm" onClick={onAddHabit}>
            {t("controls.addHabit")}
          </Button>
        </div>
      ) : view === "monthRow" ? (
        // Month Row View - Displays habits in a horizontal layout
        <MonthRowView
          habit={habits[0]}
          habits={habits}
          color={colorTheme}
          days={days}
          completions={completions}
          onToggle={onToggleHabit}
          onEditHabit={onEditHabit}
          onAddHabit={onAddHabit}
        />
      ) : (
        // Month Grid View - Displays habits in a grid layout
        <MonthGridView
          habit={habits[0]}
          habits={habits}
          color={colorTheme}
          days={days}
          completions={completions}
          onToggle={onToggleHabit}
          onEditHabit={onEditHabit}
          onAddHabit={onAddHabit}
        />
      )}
    </div>
  );
};
