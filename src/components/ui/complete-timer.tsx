"use client";

import { Button } from "@/components/ui/button";
import { xIconPath } from "@/components/ui/x-icon";
import confettiLib from "canvas-confetti";
import { useMutation, useQuery } from "convex/react";
import { Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

/**
 * Props for the CompleteTimer component
 * @param count Current completion count for the habit
 * @param timerDuration Duration in minutes for the timer
 * @param onComplete Callback function to execute when timer completes
 * @param disabled Optional flag to disable the timer button
 * @param habitId Unique identifier for the habit
 * @param variant Optional UI variant for the button styling
 */
interface CompleteTimerProps {
  count: number;
  timerDuration: number;
  onComplete: () => Promise<void>;
  disabled?: boolean;
  habitId: Id<"habits">;
  variant?: "default" | "ghost";
}

/**
 * CompleteTimer - A component that manages a countdown timer for habit completion
 *
 * This component provides a button that can:
 * 1. Start a timer for a specified duration
 * 2. Display the remaining time
 * 3. Cancel an ongoing timer
 * 4. Trigger a completion callback when the timer finishes
 */
export function CompleteTimer({
  count,
  timerDuration,
  disabled = false,
  habitId,
  variant = "default",
}: CompleteTimerProps) {
  // State for managing scheduling status and remaining time
  const [isScheduling, setIsScheduling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Ref to prevent multiple completion callbacks
  const hasCompletedRef = useRef(false);

  // Translations and API mutations
  const t = useTranslations("calendar.controls");
  const schedule = useMutation(api.habits.scheduleHabitIncrement);
  const cancelSchedule = useMutation(api.habits.cancelScheduledIncrement);
  const habit = useQuery(api.habits.get, habitId ? { id: habitId } : "skip");

  // Inside the component, add confetti shape memoization
  const confettiShape = useMemo(() => confettiLib.shapeFromPath(xIconPath), []);

  /**
   * Starts the timer by scheduling a habit increment
   * Cancels any existing timer before starting a new one
   */
  const handleStartTimer = useCallback(
    async (durationMs: number) => {
      if (!habitId) return;

      setIsScheduling(true);
      try {
        // Cancel existing timer if present
        if (habit?.scheduledTimer) {
          await cancelSchedule({ habitId });
        }
        // Schedule new timer
        await schedule({
          habitId,
          durationMs,
          clientNow: Date.now(),
        });
      } catch (error) {
        console.error("Schedule mutation failed:", error);
      } finally {
        setIsScheduling(false);
      }
    },
    [habitId, schedule, cancelSchedule, habit],
  );

  /**
   * Cancels the current timer and resets the UI state
   */
  const handleStopTimer = useCallback(async () => {
    if (!habitId) return;
    try {
      await cancelSchedule({ habitId });
      setTimeLeft(null);
    } catch (error) {
      console.error("Failed to cancel schedule:", error);
    }
  }, [habitId, cancelSchedule]);

  /**
   * Effect to manage the countdown timer and completion
   * Updates every second and triggers completion callback when timer ends
   */
  useEffect(() => {
    // Reset timer state if no timer end is set
    if (!habit?.timerEnd) {
      setTimeLeft(null);
      hasCompletedRef.current = false;
      return;
    }

    const updateTime = () => {
      const remaining = habit.timerEnd! - Date.now();
      if (remaining <= 0) {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          setTimeLeft(null);
          // Fire confetti
          confettiLib({
            angle: 90 + (Math.random() - 0.5) * 90,
            particleCount: 17,
            spread: 45 + Math.random() * 75,
            startVelocity: 35,
            gravity: 0.7,
            decay: 0.9,
            ticks: 200,
            colors: [
              "#FF0000",
              "#FFA500",
              "#FFFF00",
              "#00FF00",
              "#00FFFF",
              "#0000FF",
              "#FF00FF",
            ],
            shapes: [confettiShape],
            scalar: 1.5,
            origin: { x: 0.5, y: 1 },
            disableForReducedMotion: false,
          });
        }
        return;
      }
      setTimeLeft(remaining);
    };

    // Initialize timer and set up interval
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [habit?.timerEnd, confettiShape]);

  // Render button with dynamic content based on timer state
  return (
    <Button
      variant={variant}
      size="sm"
      className="h-6 w-full text-xs"
      onClick={() =>
        !timeLeft
          ? handleStartTimer(timerDuration * 60 * 1000)
          : handleStopTimer()
      }
      disabled={disabled || isScheduling}
    >
      {timeLeft !== null && timeLeft > 0 ? (
        `${Math.ceil(timeLeft / 1000)}s`
      ) : isScheduling ? (
        t("scheduling")
      ) : count > 0 ? (
        <Timer className="h-4 w-4" />
      ) : (
        t("start")
      )}
    </Button>
  );
}
