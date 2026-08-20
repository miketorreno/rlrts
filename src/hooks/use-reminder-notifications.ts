"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  isNotificationSupported,
  requestNotificationPermission,
  showNotification,
} from "@/lib/notifications";

const POLL_INTERVAL = 30_000;

export function useReminderNotifications() {
  const dueReminders = useQuery(api.leaves.getDueReminders);
  const markDelivered = useMutation(api.leaves.markReminderDelivered);
  const notifiedRef = useRef<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if (isNotificationSupported()) {
      requestNotificationPermission();
    }
  }, []);

  // Process due reminders
  useEffect(() => {
    if (!dueReminders || dueReminders.length === 0) return;

    for (const reminder of dueReminders) {
      const key = reminder.leafId;
      if (notifiedRef.current.has(key)) continue;
      notifiedRef.current.add(key);

      showNotification(
        "Goal Streak Reminder",
        `Time to do: ${reminder.leafName}`,
      );

      markDelivered({ leafId: reminder.leafId });
    }
  }, [dueReminders, markDelivered]);

  // Re-query periodically (Convex useQuery auto-subscribes, but
  // we also want to trigger the hook to re-evaluate)
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render by toggling a ref; the useQuery subscription
      // handles the actual data, but this ensures processing runs
      notifiedRef.current = new Set();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);
}
