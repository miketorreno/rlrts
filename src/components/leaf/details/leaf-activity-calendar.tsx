"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getActivityCalendarTheme } from "@/lib/colors";
import { motion } from "framer-motion";
import { useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

/**
 * A client-side component that renders a GitHub-style activity calendar for leaf tracking.
 * Uses react-activity-calendar under the hood with custom styling and animations.
 */

interface LeafActivityCalendarProps {
  /** Array of daily activity data with date, count, and intensity level */
  calendarData: Array<{
    date: string;
    count: number;
    level: number;
  }>;
  /** Raw completion data from the database, used for loading state */
  completions:
    | Array<{
        leafId: Id<"leaves">;
        completedAt: number;
      }>
    | undefined;
  /** Visual customization options for the calendar grid */
  calendarSize: {
    blockSize: number;
    blockMargin: number;
    showLabels: boolean;
  };
  /** Theme color key for the calendar's color scheme */
  colorTheme: string;
}

export function LeafActivityCalendar({
  calendarData,
  completions,
  calendarSize,
  colorTheme,
}: LeafActivityCalendarProps) {
  // Reference to the scrollable container for auto-scrolling to latest entries
  const containerRef = useRef<HTMLDivElement>(null);
  // Get color theme based on the provided theme key
  const theme = getActivityCalendarTheme(colorTheme);

  // Show loading skeleton while completions are being fetched
  if (!completions) {
    return <Skeleton className="h-37.5 w-full" />;
  }

  // Hide calendar completely if no data is available
  if (calendarData.length === 0) {
    return null;
  }

  return (
    <Card className="border p-2 shadow-md">
      {/* Wrapper for fade-in and slide-up animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0, 0.7, 0.1, 1] }}
        // Auto-scroll to the most recent entries after animation completes
        onAnimationComplete={() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({
              left: containerRef.current.scrollWidth,
              behavior: "smooth",
            });
          }
        }}
      >
        {/* Horizontally scrollable container for the calendar */}
        <div className="overflow-x-auto" ref={containerRef}>
          <div className="inline-block">
            <ActivityCalendar
              data={calendarData}
              showWeekdayLabels={true}
              blockRadius={20}
              hideColorLegend={true}
              hideTotalCount={true}
              weekStart={0} // Start week on Sunday
              blockSize={calendarSize.blockSize}
              blockMargin={calendarSize.blockMargin}
              fontSize={10}
              maxLevel={4} // Maximum intensity level for activity blocks
              theme={theme}
            />
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
