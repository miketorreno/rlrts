import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, GripHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

/**
 * View controls component for switching between different twig layouts.
 * Provides a tabbed interface to toggle between month grid and row views.
 * Uses Shadcn UI tabs with custom icons and internationalization.
 */

/**
 * Type defining the available twig view modes
 * monthRow: Horizontal layout with leaves in rows
 * monthGrid: Traditional twig grid layout
 */
export type TwigView = "monthRow" | "monthGrid";

/**
 * Props interface for the ViewControls component
 */
interface ViewControlsProps {
  /** Current active view mode */
  twigView: TwigView;
  /** Callback for handling view mode changes */
  onViewChange: (view: TwigView) => void;
}

/**
 * Memoized component for switching between twig view modes.
 * Uses tabs for intuitive switching between grid and row layouts.
 * Includes icons for better visual representation of each view.
 */
export const ViewControls = memo(
  ({ twigView, onViewChange }: ViewControlsProps) => {
    const t = useTranslations("twig.views");

    /**
     * Handles tab value changes and triggers the view change callback
     * Casts the string value to TwigView type
     */
    const handleValueChange = (value: string) => {
      onViewChange(value as TwigView);
    };

    return (
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Tabs value={twigView} onValueChange={handleValueChange}>
            <TabsList>
              {/* Grid view tab with twig icon */}
              <TabsTrigger asChild value="monthGrid">
                <button className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {t("twig")}
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
  },
);

ViewControls.displayName = "ViewControls";
