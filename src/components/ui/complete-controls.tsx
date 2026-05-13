"use client";

import { Button } from "@/components/ui/button";
import { CompleteTimer } from "@/components/ui/complete-timer";
import { ConfettiButton } from "@/components/ui/confetti";
import { xIconPath } from "@/components/ui/x-icon";
import NumberFlow from "@number-flow/react";
import confettiLib from "canvas-confetti";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import { Id } from "../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

/**
 * A versatile control component that handles completion tracking with optional timer functionality.
 * Supports increment/decrement operations and displays confetti animations on completion.
 */

interface CompleteControlsProps {
  /** Current count value */
  count: number;
  /** Callback to increment the count */
  onIncrement: () => Promise<void>;
  /** Callback to decrement the count */
  onDecrement: () => Promise<void>;
  /** Visual style variant for the buttons */
  variant?: "default" | "ghost";
  /** Timer duration in minutes (optional) */
  timerDuration?: number;
  /** Callback triggered on completion (increment/decrement/timer finish) */
  onComplete?: () => void;
  /** Name of the leaf */
  leafName?: string;
  /** Whether the controls are disabled */
  disabled?: boolean;
  /** Leaf ID */
  leafId: Id<"leaves">;
}

export function CompleteControls({
  count,
  onIncrement,
  onDecrement,
  variant = "default",
  timerDuration,
  onComplete,
  disabled = false,
  leafId,
}: CompleteControlsProps) {
  const t = useTranslations("calendar.controls");
  const confettiShape = useMemo(() => confettiLib.shapeFromPath(xIconPath), []);

  const handleIncrement = useCallback(async () => {
    await onIncrement();
    onComplete?.();
  }, [onIncrement, onComplete]);

  const handleDecrement = useCallback(async () => {
    await onDecrement();
    onComplete?.();
  }, [onDecrement, onComplete]);

  const getConfettiOptions = useCallback(
    (origin?: { x: number; y: number }) => ({
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
      origin: origin || { x: 0.5, y: 1 },
      disableForReducedMotion: false,
    }),
    [confettiShape],
  );

  if (!leafId) {
    console.error("CompleteControls requires leafId");
    return null;
  }

  // Timer mode with count = 0: Show start button
  if (timerDuration) {
    if (count === 0) {
      return (
        <div className="flex w-24 flex-col gap-px">
          <CompleteTimer
            count={count}
            timerDuration={timerDuration}
            onComplete={handleIncrement}
            disabled={disabled}
            leafId={leafId}
            variant={variant}
          />
        </div>
      );
    }

    // Timer mode with count > 0: Show decrement and timer controls
    return (
      <div className="flex w-24 flex-col gap-px">
        <div className="flex w-24 items-center justify-between gap-1">
          <Button
            variant={variant}
            size="icon"
            className="aspect-square h-6 w-6 rounded-full p-0"
            onClick={handleDecrement}
            disabled={disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center font-medium">
            <NumberFlow value={count} format={{ style: "decimal" }} />
          </div>
          <CompleteTimer
            count={count}
            timerDuration={timerDuration}
            onComplete={handleIncrement}
            disabled={disabled}
            leafId={leafId}
            variant={variant}
          />
        </div>
      </div>
    );
  }

  // Non-timer mode with count = 0: Show complete button
  if (count === 0) {
    return (
      <div className="flex w-24 flex-col gap-px">
        <ConfettiButton
          variant={variant}
          size="sm"
          className="h-6 w-24 text-xs"
          onClick={handleIncrement}
          options={getConfettiOptions()}
          disabled={disabled}
        >
          {t("complete")}
        </ConfettiButton>
      </div>
    );
  }

  // Non-timer mode with count > 0: Show increment/decrement controls
  return (
    <div className="flex w-24 flex-col gap-px">
      <div className="flex w-24 items-center justify-between">
        <Button
          variant={variant}
          size="icon"
          className="aspect-square h-6 w-6 rounded-full p-0"
          onClick={handleDecrement}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-18 text-center font-medium">
          <NumberFlow value={count} format={{ style: "decimal" }} />
        </span>
        <ConfettiButton
          variant={variant}
          size="icon"
          className="aspect-square h-6 w-6 rounded-full p-0"
          onClick={handleIncrement}
          options={getConfettiOptions()}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </ConfettiButton>
      </div>
    </div>
  );
}
