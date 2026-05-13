import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// import { Id } from "@server/convex/_generated/dataModel";

import { MonthGridView } from "./month-grid-view";
import { MonthRowView } from "./month-row-view";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Individual calendar component that displays a single calendar's leaves in either grid or row view.
 * Handles the display of calendar name, leaves, and their completion states.
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
  /** Array of leaves associated with this calendar */
  leaves: Array<{
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  }>;
  /** Array of dates to display in the calendar */
  days: string[];
  /** Array of leaf completion records */
  completions: Array<{
    leafId: Id<"leaves">;
    completedAt: number;
  }>;
  /** Callback to add a new leaf to this calendar */
  onAddLeaf: () => void;
  /** Callback to edit a specific leaf's properties */
  onEditLeaf: (leaf: {
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  }) => void;
  /** Callback to toggle leaf completion for a specific date */
  onToggleLeaf: (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => Promise<void>;
  /** Current view mode of the calendar */
  view: CalendarViewType;
}

/**
 * Component that renders an individual calendar with its leaves
 * Supports two view modes: month row and month grid
 */
export const CalendarItem = ({
  calendar,
  leaves,
  days,
  completions,
  onAddLeaf,
  onEditLeaf,
  onToggleLeaf,
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

      {/* Calendar Content - Shows empty state or leaves based on view mode */}
      {leaves.length === 0 ? (
        // Empty state when no leaves exist
        <div className="flex w-full flex-col items-center justify-center space-y-8 pb-16">
          <p className="text-sm text-muted-foreground">
            {t("emptyState.noLeaves")}
          </p>
          <Button size="sm" onClick={onAddLeaf}>
            {t("controls.addLeaf")}
          </Button>
        </div>
      ) : view === "monthRow" ? (
        // Month Row View - Displays leaves in a horizontal layout
        <MonthRowView
          leaf={leaves[0]}
          leaves={leaves}
          color={colorTheme}
          days={days}
          completions={completions}
          onToggle={onToggleLeaf}
          onEditLeaf={onEditLeaf}
          onAddLeaf={onAddLeaf}
        />
      ) : (
        // Month Grid View - Displays leaves in a grid layout
        <MonthGridView
          leaf={leaves[0]}
          leaves={leaves}
          color={colorTheme}
          days={days}
          completions={completions}
          onToggle={onToggleLeaf}
          onEditLeaf={onEditLeaf}
          onAddLeaf={onAddLeaf}
        />
      )}
    </div>
  );
};
