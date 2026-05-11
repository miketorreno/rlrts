import {
  NewCalendarDialog,
  NewHabitDialog,
} from "@/components/calendar/calendar-dialogs";
import { CalendarItem } from "@/components/calendar/calendar-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ViewControls } from "@/components/ui/view-controls";
import { useDialogState } from "@/hooks/use-dialog-state";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useRouter } from "@/i18n/routing";
import { Calendar, Completion, Day, Habit, Id } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "react-hot-toast";

import { CalendarSkeletons } from "./calendar-skeletons";

/**
 * Main calendar container component that manages the display and interaction of calendars and habits.
 * Handles calendar/habit CRUD operations and view switching between month row and grid layouts.
 */

const MotionCard = motion(Card);

/**
 * Type for calendar view modes - either month row or month grid layout
 */
type CalendarView = "monthRow" | "monthGrid";

/**
 * Interface defining all calendar-related data operations
 * Includes CRUD operations for calendars and habits, plus habit completion toggling
 */
interface CalendarData {
  handleAddCalendar: (name: string, color: string) => Promise<void>;
  handleAddHabit: (
    name: string,
    calendarId: Id<"calendars">,
    timerDuration?: number,
  ) => Promise<void>;
  handleToggleHabit: (
    habitId: Id<"habits">,
    date: string,
    count: number,
  ) => Promise<void>;
}

/**
 * Props interface for the CalendarContainer component
 * Contains all necessary data and callbacks for calendar functionality
 */
interface CalendarContainerProps {
  calendarView: CalendarView;
  calendars: Calendar[];
  completions: Completion[];
  days: Day[];
  habits: Habit[];
  monthViewData: CalendarData;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  isLoading?: boolean;
}

/**
 * Empty state component shown when no calendars exist
 */
function EmptyState({ monthViewData }: { monthViewData: CalendarData }) {
  const t = useTranslations("calendar.container");
  const {
    state,
    openNewCalendar,
    updateCalendarName,
    updateCalendarColor,
    resetCalendarState,
  } = useDialogState();
  const toastMessages = useToastMessages();

  const handleAddCalendar = useCallback(async () => {
    const { name, color } = state.calendar;
    if (!name.trim()) return;

    await monthViewData.handleAddCalendar(name, color);
    toastMessages.calendar.created();
    resetCalendarState();
  }, [monthViewData, state.calendar, toastMessages, resetCalendarState]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16">
      <p className="text-sm text-muted-foreground">
        {t("emptyState.noCalendars")}
      </p>
      <Button variant="default" onClick={openNewCalendar}>
        <PlusCircle className="h-4 w-4" />
        {t("addCalendar")}
      </Button>
      <NewCalendarDialog
        isOpen={state.calendar.isNewOpen}
        onOpenChange={() => resetCalendarState()}
        name={state.calendar.name}
        onNameChange={updateCalendarName}
        color={state.calendar.color}
        onColorChange={updateCalendarColor}
        onSubmit={handleAddCalendar}
      />
    </div>
  );
}

/**
 * Main calendar container component that orchestrates the display and interaction
 * of calendars, habits, and their associated dialogs
 */
export function CalendarContainer({
  calendarView,
  calendars,
  completions,
  days,
  habits,
  monthViewData,
  view,
  onViewChange,
  isLoading = false,
}: CalendarContainerProps) {
  const t = useTranslations("calendar.container");
  const toastMessages = useToastMessages();
  const router = useRouter();

  // Dialog state management for calendar and habit operations
  const {
    state,
    openNewCalendar,
    openNewHabit,
    updateCalendarName,
    updateCalendarColor,
    updateHabitName,
    updateHabitTimer,
    resetCalendarState,
    resetHabitState,
  } = useDialogState();

  /**
   * Handles creation of a new calendar
   * Validates name and triggers toast notification on success
   */
  const handleAddCalendar = useCallback(async () => {
    const { name, color } = state.calendar;
    if (!name.trim()) return;

    await monthViewData.handleAddCalendar(name, color);
    toastMessages.calendar.created();
    resetCalendarState();
  }, [monthViewData, state.calendar, toastMessages, resetCalendarState]);

  /**
   * Handles creation of a new habit within a calendar
   * Validates name and selected calendar, includes error handling
   */
  const handleAddHabit = useCallback(async () => {
    const { name, timerDuration, selectedCalendar } = state.habit;
    if (!name.trim() || !selectedCalendar) return;

    try {
      await monthViewData.handleAddHabit(
        name,
        selectedCalendar._id,
        timerDuration,
      );
      toastMessages.habit.created();
      resetHabitState();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add habit");
    }
  }, [monthViewData, state.habit, toastMessages, resetHabitState]);

  /**
   * Handles toggling habit completion for a specific date
   * Updates completion count in the database
   */
  const handleToggleHabit = useCallback(
    async (habitId: Id<"habits">, date: string, count: number) => {
      await monthViewData.handleToggleHabit(habitId, date, count);
    },
    [monthViewData],
  );

  // Show loading skeletons while data is being fetched
  if (isLoading) {
    return <CalendarSkeletons view={view} />;
  }

  // Show empty state when no calendars exist
  if (calendars.length === 0) {
    return <EmptyState monthViewData={monthViewData} />;
  }

  return (
    <>
      {/* Animated container for calendar view with smooth transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <MotionCard
          key={calendarView}
          className="space-y-8 border p-2 shadow-md"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          exit={{ y: 0 }}
          transition={{ duration: 1, ease: [0, 0.7, 0.1, 1] }}
        >
          {/* Controls for switching between month row and grid views */}
          <ViewControls
            calendarView={calendarView}
            onViewChange={onViewChange}
          />

          {/* Container for all calendar items */}
          <div className="flex w-full flex-col gap-4 md:px-8">
            <div className="w-full">
              {/* Map through calendars and render individual calendar items */}
              {[...calendars]
                .sort(
                  (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
                )
                .map((calendar) => {
                  const calendarHabits = habits.filter(
                    (h) => h.calendarId === calendar._id,
                  );
                  return (
                    <CalendarItem
                      calendar={calendar}
                      completions={completions}
                      days={days}
                      habits={calendarHabits}
                      key={calendar._id}
                      onAddHabit={() => openNewHabit(calendar)}
                      onEditHabit={(habit) =>
                        router.push(`/habits/${habit._id}`)
                      }
                      onToggleHabit={handleToggleHabit}
                      view={view}
                    />
                  );
                })}
            </div>
          </div>

          {/* Button to add new calendar */}
          <div className="flex justify-center pb-16">
            <Button variant="default" onClick={openNewCalendar}>
              <PlusCircle className="h-4 w-4" />
              {t("addCalendar")}
            </Button>
          </div>
        </MotionCard>
      </AnimatePresence>

      {/* Dialog components for creating calendars and habits */}
      <NewCalendarDialog
        isOpen={state.calendar.isNewOpen}
        onOpenChange={() => resetCalendarState()}
        name={state.calendar.name}
        onNameChange={updateCalendarName}
        color={state.calendar.color}
        onColorChange={updateCalendarColor}
        onSubmit={handleAddCalendar}
      />
      <NewHabitDialog
        isOpen={state.habit.isNewOpen}
        onOpenChange={() => resetHabitState()}
        name={state.habit.name}
        onNameChange={updateHabitName}
        timerDuration={state.habit.timerDuration}
        onTimerDurationChange={updateHabitTimer}
        onSubmit={handleAddHabit}
      />
    </>
  );
}
