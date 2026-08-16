import { format, startOfDay, startOfWeek } from "date-fns";
import { useEffect, useRef } from "react";

export type TodoCadence = "daily" | "weekly";

const STORAGE_KEYS: Record<TodoCadence, string> = {
  daily: "rlrts:todos:period:daily",
  weekly: "rlrts:todos:period:weekly",
};

export function periodStart(cadence: TodoCadence, now: Date = new Date()): Date {
  if (cadence === "daily") {
    return startOfDay(now);
  }
  return startOfWeek(now, { weekStartsOn: 1 });
}

export function periodKey(cadence: TodoCadence, now: Date = new Date()): string {
  return format(periodStart(cadence, now), "yyyy-MM-dd");
}

export function useTodoPeriodRollover(resetPeriod: () => Promise<unknown>) {
  const resetRef = useRef(resetPeriod);

  useEffect(() => {
    resetRef.current = resetPeriod;
  });

  useEffect(() => {
    let cancelled = false;
    const cadences: TodoCadence[] = ["daily", "weekly"];
    let needsReset = false;

    for (const cadence of cadences) {
      const current = periodKey(cadence);
      const stored = window.localStorage.getItem(STORAGE_KEYS[cadence]);
      if (stored === null) {
        window.localStorage.setItem(STORAGE_KEYS[cadence], current);
      } else if (stored !== current) {
        window.localStorage.setItem(STORAGE_KEYS[cadence], current);
        needsReset = true;
      }
    }

    if (needsReset && !cancelled) {
      void resetRef.current();
    }

    return () => {
      cancelled = true;
    };
  }, []);
}
