"use client";

import { HabitActivityCalendar } from "@/components/habit/details/habit-activity-calendar";
import { HabitBackNavigation } from "@/components/habit/details/habit-back-navigation";
import { HabitDeleteDialog } from "@/components/habit/details/habit-delete-dialog";
import { HabitEditForm } from "@/components/habit/details/habit-edit-form";
import { HabitStatistics } from "@/components/habit/details/habit-statistics";
import { SingleMonthCalendar } from "@/components/habit/details/single-month-calendar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

/**
 * HabitDetails Component
 * A comprehensive view for managing and displaying habit details including:
 * - Activity calendar visualization
 * - Monthly statistics
 * - Habit editing capabilities
 * - Deletion functionality
 */

/**
 * Props interface for the HabitDetails component
 * @property habit - The habit object containing core habit data
 * @property calendar - The calendar object this habit belongs to
 * @property onDelete - Callback function triggered after successful habit deletion
 */
interface HabitDetailsProps {
  habit: {
    _id: Id<"habits">;
    name: string;
    timerDuration?: number;
    calendarId: Id<"calendars">;
    position?: number;
  };
  calendar: {
    _id: Id<"calendars">;
    name: string;
    colorTheme: string;
  };
  onDelete: () => void;
}

/**
 * Determines calendar visualization properties based on screen size
 * Uses window.matchMedia for responsive design
 * @returns Object containing blockSize, blockMargin, and showLabels settings
 */
function getCalendarSize() {
  if (typeof window === "undefined")
    return {
      blockSize: 8,
      blockMargin: 2,
      showLabels: false,
    };

  const isLg = window.matchMedia("(min-width: 1024px)").matches;
  const isMd = window.matchMedia("(min-width: 768px)").matches;

  if (isLg) return { blockSize: 12, blockMargin: 2, showLabels: true };
  if (isMd) return { blockSize: 10, blockMargin: 2, showLabels: true };
  return { blockSize: 8, blockMargin: 1, showLabels: false };
}

export function HabitDetails({ habit, calendar }: HabitDetailsProps) {
  // Core hooks and state management
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [name, setName] = useState(habit.name);
  const [timerDuration, setTimerDuration] = useState<number | undefined>(
    habit.timerDuration,
  );
  const [selectedCalendarId, setSelectedCalendarId] = useState<Id<"calendars">>(
    habit.calendarId,
  );
  const [position, setPosition] = useState<number>(habit.position ?? 1);
  const [calendarSize, setCalendarSize] = useState(getCalendarSize());

  // Convex API mutations and queries
  const updateHabit = useMutation(api.habits.update);
  const deleteHabit = useMutation(api.habits.remove);
  const markComplete = useMutation(api.habits.markComplete);
  const calendars = useQuery(api.calendars.list);
  const habits = useQuery(api.habits.list, { calendarId: selectedCalendarId });

  /**
   * Window resize handler to update calendar visualization
   * Ensures responsive design across different screen sizes
   */
  useEffect(() => {
    function handleResize() {
      setCalendarSize(getCalendarSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /**
   * Calculate the date range for habit completions
   * Shows data for the last year up to current date
   */
  const dateRange = useMemo(() => {
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

    return {
      startDate: start.getTime(),
      endDate: end.getTime(),
    };
  }, []);

  const completions = useQuery(api.habits.getCompletions, dateRange);

  /**
   * Processes completion data into a format suitable for calendar visualization
   * Maps dates to completion counts and assigns level (0-4) based on completion frequency
   */
  const calendarData = useMemo(() => {
    if (!completions?.completions) return [];

    const dates = new Map();
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.set(d.toISOString().split("T")[0], 0);
    }

    completions.completions
      .filter((completion) => completion.habitId === habit._id)
      .forEach((completion) => {
        const date = new Date(completion.completedAt)
          .toISOString()
          .split("T")[0];
        if (dates.has(date)) {
          dates.set(date, (dates.get(date) || 0) + 1);
        }
      });

    return Array.from(dates).map(([date, count]) => {
      let level;
      if (count === 0) level = 0;
      else if (count === 1) level = 1;
      else if (count === 2) level = 2;
      else if (count === 3) level = 3;
      else level = 4;

      return {
        date,
        count,
        level,
      };
    });
  }, [completions, habit._id, dateRange]);

  /**
   * Handles habit updates
   * Validates input and shows success/error toasts
   */
  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateHabit({
        id: habit._id,
        name,
        timerDuration,
        calendarId: selectedCalendarId,
        position,
      });
      toast({ description: "Habit updated successfully" });
      router.push("/calendar");
    } catch (error) {
      toast({
        description: `Failed to update habit: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles habit deletion
   * Includes navigation and cleanup with error handling
   */
  const handleDelete = async () => {
    try {
      setShowDeleteAlert(false);
      router.replace("/calendar");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await deleteHabit({ id: habit._id });
      toast({ description: "Habit deleted", variant: "destructive" });
    } catch (error) {
      toast({
        description: `Failed to delete habit: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <HabitBackNavigation />

      {/* Habit header with name and timer duration */}
      <div className="text-center">
        <h1 className="mb-8 text-2xl font-bold">
          {name}
          {timerDuration && (
            <span className="ml-2 text-muted-foreground">
              ({timerDuration}m)
            </span>
          )}
        </h1>
      </div>

      {/* Main content layout with responsive grid */}
      <div className="mx-auto max-w-[7xl] space-y-8 md:space-y-6 lg:flex lg:items-start lg:justify-center lg:space-x-6 lg:space-y-0">
        {/* Single month calendar view */}
        <div className="mx-auto w-full max-w-[300px] lg:mx-0 lg:w-[300px]">
          <SingleMonthCalendar
            habit={habit}
            colorTheme={calendar.colorTheme}
            completions={completions?.completions ?? []}
            onToggle={async (habitId, date, count) => {
              try {
                const completedAt = new Date(date).getTime();
                await markComplete({ habitId, completedAt, count });
              } catch (error) {
                toast({
                  description: `Failed to update completion: ${error instanceof Error ? error.message : "Unknown error"}`,
                  variant: "destructive",
                });
              }
            }}
          />
        </div>

        {/* Activity calendar and statistics section */}
        <div className="space-y-4">
          <HabitActivityCalendar
            calendarData={calendarData}
            completions={completions?.completions}
            calendarSize={calendarSize}
            colorTheme={calendar.colorTheme}
          />

          <HabitStatistics
            habitId={habit._id}
            colorTheme={calendar.colorTheme}
            completions={completions?.completions}
          />
        </div>
      </div>

      {/* Habit management forms and dialogs */}
      <HabitEditForm
        name={name}
        onNameChange={setName}
        timerDuration={timerDuration}
        onTimerDurationChange={setTimerDuration}
        selectedCalendarId={selectedCalendarId}
        onCalendarChange={setSelectedCalendarId}
        position={position}
        onPositionChange={setPosition}
        calendars={calendars}
        habits={habits}
        onSave={handleSave}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <HabitDeleteDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        habitName={name}
      />
    </>
  );
}
