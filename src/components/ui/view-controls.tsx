import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, GripHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

/**
 * View controls component for switching between different calendar layouts.
 * Provides a tabbed interface to toggle between month grid and row views.
 * Uses Shadcn UI tabs with custom icons and internationalization.
 */

/**
 * Type defining the available calendar view modes
 * monthRow: Horizontal layout with habits in rows
 * monthGrid: Traditional calendar grid layout
 */
export type CalendarView = "monthRow" | "monthGrid";

/**
 * Props interface for the ViewControls component
 */
interface ViewControlsProps {
  /** Current active view mode */
  calendarView: CalendarView;
  /** Callback for handling view mode changes */
  onViewChange: (view: CalendarView) => void;
}

/**
 * Memoized component for switching between calendar view modes.
 * Uses tabs for intuitive switching between grid and row layouts.
 * Includes icons for better visual representation of each view.
 */
export const ViewControls = memo(({ calendarView, onViewChange }: ViewControlsProps) => {
  const t = useTranslations("calendar.views");

  /**
   * Handles tab value changes and triggers the view change callback
   * Casts the string value to CalendarView type
   */
  const handleValueChange = (value: string) => {
    onViewChange(value as CalendarView);
  };

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Tabs value={calendarView} onValueChange={handleValueChange}>
          <TabsList>
            {/* Grid view tab with calendar icon */}
            <TabsTrigger asChild value="monthGrid">
              <button className="flex items-center">
                <CalendarDays className="mr-2 h-4 w-4" />
                {t("calendar")}
              </button>
            </TabsTrigger>
            {/* Row view tab with horizontal grip icon */}
            <TabsTrigger asChild value="monthRow">
              <button className="flex items-center">
                <GripHorizontal className="mr-2 h-4 w-4" />
                {t("row")}
              </button>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
});

ViewControls.displayName = "ViewControls";
