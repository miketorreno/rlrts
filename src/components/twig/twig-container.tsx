import { NewTwigDialog, NewLeafDialog } from "@/components/twig/twig-dialogs";
import { TwigItem } from "@/components/twig/twig-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewControls } from "@/components/ui/view-controls";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useRouter } from "@/i18n/routing";
import { Twig, Completion, Day, Leaf, Id } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

import { TwigSkeletons } from "../twig/twig-skeletons";

/**
 * Main twig container component that manages the display and interaction of twigs and leaves.
 * Handles twig/leaf CRUD operations and view switching between month row and grid layouts.
 */

const MotionCard = motion.create(Card);

/**
 * Type for twig view modes - either month row or month grid layout
 */
type TwigView = "monthRow" | "monthGrid";

/**
 * Interface defining all twig-related data operations
 * Includes CRUD operations for twigs and leaves, plus leaf completion toggling
 */
interface TwigData {
  handleAddTwig: (name: string, color: string) => Promise<void>;
  handleAddLeaf: (
    name: string,
    twigId: Id<"twigs">,
    timerDuration?: number,
  ) => Promise<void>;
  handleToggleLeaf: (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => Promise<void>;
}

/**
 * Props interface for the TwigContainer component
 * Contains all necessary data and callbacks for twig functionality
 */
interface TwigContainerProps {
  twigView: TwigView;
  twigs: Twig[];
  completions: Completion[];
  days: Day[];
  leaves: Leaf[];
  monthViewData: TwigData;
  view: TwigView;
  onViewChange: (view: TwigView) => void;
  isLoading?: boolean;
}

/**
 * Empty state component shown when no twigs exist
 */
function EmptyState({ monthViewData }: { monthViewData: TwigData }) {
  const t = useTranslations("twig.container");
  const {
    state,
    openNewTwig,
    updateTwigName,
    updateTwigColor,
    resetTwigState,
  } = useDialogState();
  const toastMessages = useToastMessages();

  const handleAddTwig = useCallback(async () => {
    const { name, color } = state.twig;
    if (!name.trim()) return;

    await monthViewData.handleAddTwig(name, color);
    toastMessages.twig.created();
    resetTwigState();
  }, [monthViewData, state.twig, toastMessages, resetTwigState]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <p className="text-sm text-muted-foreground">{t("emptyState.noTwigs")}</p>
      <Button variant="default" onClick={openNewTwig}>
        <PlusCircle className="h-4 w-4" />
        {t("addTwig")}
      </Button>
      <NewTwigDialog
        isOpen={state.twig.isNewOpen}
        onOpenChange={() => resetTwigState()}
        name={state.twig.name}
        onNameChange={updateTwigName}
        color={state.twig.color}
        onColorChange={updateTwigColor}
        onSubmit={handleAddTwig}
      />
    </div>
  );
}

/**
 * Main twig container component that orchestrates the display and interaction
 * of twigs, leaves, and their associated dialogs
 */
export function TwigContainer({
  twigView,
  twigs,
  completions,
  days,
  leaves,
  monthViewData,
  view,
  onViewChange,
  isLoading = false,
}: TwigContainerProps) {
  const t = useTranslations("twig.container");
  const toastMessages = useToastMessages();
  const router = useRouter();

  // Dialog state management for twig and leaf operations
  const {
    state,
    openNewTwig,
    openNewLeaf,
    updateTwigName,
    updateTwigColor,
    updateLeafName,
    updateLeafTimer,
    resetTwigState,
    resetLeafState,
  } = useDialogState();

  /**
   * Handles creation of a new twig
   * Validates name and triggers toast notification on success
   */
  const handleAddTwig = useCallback(async () => {
    const { name, color } = state.twig;
    if (!name.trim()) return;

    await monthViewData.handleAddTwig(name, color);
    toastMessages.twig.created();
    resetTwigState();
  }, [monthViewData, state.twig, toastMessages, resetTwigState]);

  /**
   * Handles creation of a new leaf within a twig
   * Validates name and selected twig, includes error handling
   */
  const handleAddLeaf = useCallback(async () => {
    const { name, timerDuration, selectedTwig } = state.leaf;
    if (!name.trim() || !selectedTwig) return;

    try {
      await monthViewData.handleAddLeaf(name, selectedTwig._id, timerDuration);
      toastMessages.leaf.created();
      resetLeafState();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add leaf");
    }
  }, [monthViewData, state.leaf, toastMessages, resetLeafState]);

  /**
   * Handles toggling leaf completion for a specific date
   * Updates completion count in the database
   */
  const handleToggleLeaf = useCallback(
    async (leafId: Id<"leaves">, date: string, count: number) => {
      await monthViewData.handleToggleLeaf(leafId, date, count);
    },
    [monthViewData],
  );

  // Show loading skeletons while data is being fetched
  if (isLoading) {
    return <TwigSkeletons view={view} />;
  }

  // Show empty state when no twigs exist
  if (twigs.length === 0) {
    return <EmptyState monthViewData={monthViewData} />;
  }

  return (
    <>
      {/* Animated container for twig view with smooth transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <MotionCard
          key={twigView}
          className="space-y-8 border p-2 shadow-md"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          exit={{ y: 0 }}
          transition={{ duration: 1, ease: [0, 0.7, 0.1, 1] }}
        >
          {/* Controls for switching between month row and grid views */}
          <ViewControls twigView={twigView} onViewChange={onViewChange} />

          {/* Container for all twig items */}
          <div className="flex w-full flex-col gap-4 md:px-8">
            <div className="w-full">
              {/* Map through twigs and render individual twig items */}
              {[...twigs]
                .sort(
                  (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
                )
                .map((twig) => {
                  const twigLeafs = leaves.filter((l) => l.twigId === twig._id);
                  return (
                    <TwigItem
                      twig={twig}
                      completions={completions}
                      days={days}
                      leaves={twigLeafs}
                      key={twig._id}
                      onAddLeaf={() => openNewLeaf(twig)}
                      onEditLeaf={(leaf) => router.push(`/leaves/${leaf._id}`)}
                      onToggleLeaf={handleToggleLeaf}
                      view={view}
                    />
                  );
                })}
            </div>
          </div>

          {/* Button to add new twig */}
          <div className="flex justify-center pb-16">
            <Button variant="default" onClick={openNewTwig}>
              <PlusCircle className="h-4 w-4" />
              {t("addTwig")}
            </Button>
          </div>
        </MotionCard>
      </AnimatePresence>

      {/* Dialog components for creating twigs and leaves */}
      <NewTwigDialog
        isOpen={state.twig.isNewOpen}
        onOpenChange={() => resetTwigState()}
        name={state.twig.name}
        onNameChange={updateTwigName}
        color={state.twig.color}
        onColorChange={updateTwigColor}
        onSubmit={handleAddTwig}
      />
      <NewLeafDialog
        isOpen={state.leaf.isNewOpen}
        onOpenChange={() => resetLeafState()}
        name={state.leaf.name}
        onNameChange={updateLeafName}
        timerDuration={state.leaf.timerDuration}
        onTimerDurationChange={updateLeafTimer}
        onSubmit={handleAddLeaf}
      />
    </>
  );
}
