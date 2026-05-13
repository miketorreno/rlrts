"use client";

import { LeafActivityCalendar } from "@/components/leaf/details/leaf-activity-calendar";
import { LeafBackNavigation } from "@/components/leaf/details/leaf-back-navigation";
import { LeafDeleteDialog } from "@/components/leaf/details/leaf-delete-dialog";
import { LeafEditForm } from "@/components/leaf/details/leaf-edit-form";
import { LeafStatistics } from "@/components/leaf/details/leaf-statistics";
import { SingleMonthCalendar } from "@/components/leaf/details/single-month-calendar";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

/**
 * LeafDetails Component
 * A comprehensive view for managing and displaying leaf details including:
 * - Activity calendar visualization
 * - Monthly statistics
 * - Leaf editing capabilities
 * - Deletion functionality
 */

/**
 * Props interface for the LeafDetails component
 * @property leaf - The leaf object containing core leaf data
 * @property calendar - The calendar object this leaf belongs to
 * @property onDelete - Callback function triggered after successful leaf deletion
 */
interface LeafDetailsProps {
  leaf: {
    _id: Id<"leaves">;
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

export function LeafDetails({ leaf, calendar }: LeafDetailsProps) {
  // Core hooks and state management
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [name, setName] = useState(leaf.name);
  const [timerDuration, setTimerDuration] = useState<number | undefined>(
    leaf.timerDuration,
  );
  const [selectedCalendarId, setSelectedCalendarId] = useState<Id<"calendars">>(
    leaf.calendarId,
  );
  const [position, setPosition] = useState<number>(leaf.position ?? 1);
  const [calendarSize, setCalendarSize] = useState(getCalendarSize());

  // Convex API mutations and queries
  const updateLeaf = useMutation(api.leaves.update);
  const deleteLeaf = useMutation(api.leaves.remove);
  const markComplete = useMutation(api.leaves.markComplete);
  const calendars = useQuery(api.calendars.list);
  const leaves = useQuery(api.leaves.list, { calendarId: selectedCalendarId });

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
   * Calculate the date range for leaf completions
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

  const completions = useQuery(api.leaves.getCompletions, dateRange);

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
      .filter((completion) => completion.leafId === leaf._id)
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
  }, [completions, leaf._id, dateRange]);

  /**
   * Handles leaf updates
   * Validates input and shows success/error toasts
   */
  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateLeaf({
        id: leaf._id,
        name,
        timerDuration,
        calendarId: selectedCalendarId,
        position,
      });
      toast({ description: "Leaf updated successfully" });
      router.push("/calendar");
    } catch (error) {
      toast({
        description: `Failed to update leaf: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  /**
   * Handles leaf deletion
   * Includes navigation and cleanup with error handling
   */
  const handleDelete = async () => {
    try {
      setShowDeleteAlert(false);
      router.replace("/calendar");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await deleteLeaf({ id: leaf._id });
      toast({ description: "Leaf deleted", variant: "destructive" });
    } catch (error) {
      toast({
        description: `Failed to delete leaf: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <LeafBackNavigation />

      {/* Leaf header with name and timer duration */}
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
            leaf={leaf}
            colorTheme={calendar.colorTheme}
            completions={completions?.completions ?? []}
            onToggle={async (leafId, date, count) => {
              try {
                const completedAt = new Date(date).getTime();
                await markComplete({ leafId, completedAt, count });
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
          <LeafActivityCalendar
            calendarData={calendarData}
            completions={completions?.completions}
            calendarSize={calendarSize}
            colorTheme={calendar.colorTheme}
          />

          <LeafStatistics
            leafId={leaf._id}
            colorTheme={calendar.colorTheme}
            completions={completions?.completions}
          />
        </div>
      </div>

      {/* Leaf management forms and dialogs */}
      <LeafEditForm
        name={name}
        onNameChange={setName}
        timerDuration={timerDuration}
        onTimerDurationChange={setTimerDuration}
        selectedCalendarId={selectedCalendarId}
        onCalendarChange={setSelectedCalendarId}
        position={position}
        onPositionChange={setPosition}
        calendars={calendars}
        leaves={leaves}
        onSave={handleSave}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <LeafDeleteDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        leafName={name}
      />
    </>
  );
}
