"use client";

import { HabitDetails } from "@/components/habit/habit-details";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvexAuth, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

/**
 * Habit Details Page
 *
 * Client component that displays detailed information for a specific habit.
 * Uses dynamic routing to fetch habit data based on the habitId parameter.
 *
 * Key features:
 * - Fetches habit and associated calendar data
 * - Handles loading states with skeleton UI
 * - Redirects to calendar if habit not found
 * - Renders HabitDetails component with edit/delete capabilities
 */
export default function HabitPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const habitId = params.habitId as Id<"habits">;

  // Always call hooks unconditionally
  const habit = useQuery(api.habits.get, { id: habitId });
  const calendar = useQuery(
    api.calendars.get,
    habit ? { id: habit.calendarId } : "skip",
  );

  // Handle redirects in useEffect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    } else if (habit === null) {
      router.replace("/calendar");
    }
  }, [isLoading, isAuthenticated, habit, router]);

  // Show loading state while checking auth
  if (isLoading || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl">
      {habit && calendar ? (
        // Render habit details when data is available
        <HabitDetails
          habit={habit}
          calendar={calendar}
          onDelete={() => router.replace("/calendar")}
        />
      ) : (
        // Show skeleton loading state while data is being fetched
        <>
          {/* Back button skeleton */}
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Main content skeleton */}
          <div className="mx-auto max-w-5xl p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="mb-8 h-8 w-48" />
              <Skeleton className="mb-8 h-[150px] w-[600px]" />
            </div>
          </div>

          {/* Form skeleton */}
          <div className="mx-auto max-w-xl p-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
