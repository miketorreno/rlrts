import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

// import { Id } from "@server/convex/_generated/dataModel";

import { MonthGridView } from "../twig/month-grid-view";
import { MonthRowView } from "../twig/month-row-view";
import { Id } from "../../../convex/_generated/dataModel";

/**
 * Individual twig component that displays a single twig's leaves in either grid or row view.
 * Handles the display of twig name, leaves, and their completion states.
 */

/**
 * Type defining the available view modes for twig display
 */
type TwigViewType = "monthRow" | "monthGrid";

/**
 * Props interface for the TwigItem component
 */
interface TwigItemProps {
  /** Twig object containing basic twig information */
  twig: {
    _id: Id<"twigs">;
    name: string;
    colorTheme: string;
  };
  /** Array of leaves associated with this twig */
  leaves: Array<{
    _id: Id<"leaves">;
    name: string;
    timerDuration?: number;
  }>;
  /** Array of dates to display in the twig */
  days: string[];
  /** Array of leaf completion records */
  completions: Array<{
    leafId: Id<"leaves">;
    completedAt: number;
  }>;
  /** Callback to add a new leaf to this twig */
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
  /** Current view mode of the twig */
  view: TwigViewType;
}

/**
 * Component that renders an individual twig with its leaves
 * Supports two view modes: month row and month grid
 */
export const TwigItem = ({
  twig,
  leaves,
  days,
  completions,
  onAddLeaf,
  onEditLeaf,
  onToggleLeaf,
  view,
}: TwigItemProps) => {
  const t = useTranslations("twig");
  const router = useRouter();

  // Ensure color theme has proper Tailwind prefix
  const colorTheme = twig.colorTheme.startsWith("bg-")
    ? twig.colorTheme
    : `bg-${twig.colorTheme}-500`;

  return (
    <div className="space-y-8">
      {/* Twig Header - Displays twig name with themed underline decoration */}
      <div className="flex justify-center">
        <div
          className="cursor-pointer pt-4"
          onClick={() => router.push(`/twigs/${twig._id}`)}
        >
          <h2
            className={`select-none text-4xl font-semibold underline decoration-wavy decoration-2 ${colorTheme.replace(
              "bg-",
              "decoration-",
            )}/30 hover:text-muted-foreground hover:no-underline`}
          >
            {twig.name}
          </h2>
        </div>
      </div>

      {/* Twig Content - Shows empty state or leaves based on view mode */}
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
