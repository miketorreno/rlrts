import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

// import { api } from "@server/convex/_generated/api";
// import { Doc, Id } from "@server/convex/_generated/dataModel";

/**
 * Custom hook for managing calendar-related data and operations in a habit tracking application.
 * Centralizes all calendar, habit, and completion data access and mutations in one place.
 *
 * Key features:
 * - Handles authentication state and skips queries when not authenticated
 * - Provides CRUD operations for calendars and habits
 * - Manages habit completion tracking with support for multiple completions per day
 * - Handles date range-based queries for completion history
 *
 * @param startDate - Beginning of the date range for fetching completions
 * @param endDate - End of the date range for fetching completions
 *
 * Note: All database operations are authenticated and will fail if user is not logged in
 */
export function useCalendarData(startDate: Date, endDate: Date) {
  const { isAuthenticated } = useConvexAuth();
  const [allCompletions, setAllCompletions] = useState<Doc<"completions">[]>(
    [],
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // --- Database Queries ---

  /**
   * Fetches all calendars owned by the authenticated user
   * Returns undefined if not authenticated, empty array if no calendars exist
   * Calendars are ordered by their position field
   */
  const calendarsQuery = useQuery(
    api.calendars.list,
    isAuthenticated ? {} : "skip",
  );

  /**
   * Fetches all habits across all calendars for the authenticated user
   * Setting calendarId to undefined retrieves habits from all calendars
   * Habits are ordered by their position within each calendar
   */
  const habitsQuery = useQuery(
    api.habits.list,
    isAuthenticated ? { calendarId: undefined } : "skip",
  );

  /**
   * Fetches paginated habit completion records within the specified date range
   * Converts JavaScript Date objects to Unix timestamps for the database query
   * Returns a paginated response with completions array and pagination metadata
   */
  const completionsQuery = useQuery(
    api.habits.getCompletions,
    isAuthenticated
      ? {
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
          limit: 100,
        }
      : "skip",
  );

  // Initialize allCompletions with first page
  useEffect(() => {
    if (completionsQuery?.completions) {
      setAllCompletions(completionsQuery.completions);
    }
  }, [completionsQuery?.completions]);

  // Load more completions when available
  const nextPageQuery = useQuery(
    api.habits.getCompletions,
    isAuthenticated && completionsQuery?.hasMore && !isLoadingMore
      ? {
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
          limit: 100,
          cursor: completionsQuery?.cursor || undefined,
        }
      : "skip",
  );

  // Append next page when loaded
  useEffect(() => {
    if (nextPageQuery?.completions) {
      setAllCompletions((prev) => [...prev, ...nextPageQuery.completions]);
      setIsLoadingMore(false);
    }
  }, [nextPageQuery?.completions]);

  const loadMoreCompletions = useCallback(() => {
    if (!completionsQuery?.hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
  }, [completionsQuery?.hasMore, isLoadingMore]);

  // --- Database Mutations ---
  // Initialize mutation functions for CRUD operations
  // Each mutation is authenticated and optimistically updates the UI
  const createCalendar = useMutation(api.calendars.create);
  const createHabit = useMutation(api.habits.create);
  const markComplete = useMutation(api.habits.markComplete);
  const updateCalendar = useMutation(api.calendars.update);
  const updateHabit = useMutation(api.habits.update);
  const deleteCalendar = useMutation(api.calendars.remove);
  const deleteHabit = useMutation(api.habits.remove);

  /**
   * Creates a new calendar for the authenticated user
   * Validates input and prevents empty calendar names
   * Position is automatically assigned based on existing calendars
   *
   * @param name - Display name for the calendar (must be non-empty)
   * @param colorTheme - Theme identifier for styling (e.g., "bg-red-500")
   */
  const handleAddCalendar = async (name: string, colorTheme: string) => {
    if (!name.trim()) return;
    await createCalendar({
      name,
      colorTheme,
    });
  };

  /**
   * Creates a new habit within a specified calendar
   * Validates input and prevents empty habit names
   * Supports optional timer duration for timed habits
   * Position is automatically assigned within the calendar
   *
   * @param name - Display name for the habit (must be non-empty)
   * @param calendarId - Parent calendar ID
   * @param timerDuration - Optional duration in minutes for timed habits
   */
  const handleAddHabit = async (
    name: string,
    calendarId: Id<"calendars">,
    timerDuration?: number,
  ) => {
    if (!name.trim()) return;
    await createHabit({
      name,
      calendarId,
      timerDuration,
    });
  };

  /**
   * Updates an existing calendar's properties
   * Validates input and prevents empty calendar names
   * Updates position and maintains order of other calendars
   *
   * @param id - Calendar ID to update
   * @param name - New display name (must be non-empty)
   * @param colorTheme - New theme identifier
   * @param position - New position in the calendar list
   */
  const handleEditCalendar = async (
    id: Id<"calendars">,
    name: string,
    colorTheme: string,
    position: number,
  ) => {
    if (!name.trim()) return;
    await updateCalendar({
      id,
      name,
      colorTheme,
      position,
    });
  };

  /**
   * Updates an existing habit's properties
   * Validates input and prevents empty habit names
   * Maintains the habit's calendar association
   *
   * @param id - Habit ID to update
   * @param name - New display name (must be non-empty)
   * @param timerDuration - New timer duration in minutes (optional)
   */
  const handleEditHabit = async (
    id: Id<"habits">,
    name: string,
    timerDuration?: number,
  ) => {
    if (!name.trim()) return;
    const habit = habitsQuery?.find((h) => h._id === id);
    if (!habit) return;

    await updateHabit({
      id,
      name,
      timerDuration,
      calendarId: habit.calendarId,
    });
  };

  /**
   * Deletes a calendar and cascades deletion to all associated habits
   * Also removes all completion records for the deleted habits
   *
   * @param id - Calendar ID to delete
   */
  const handleDeleteCalendar = async (id: Id<"calendars">) => {
    await deleteCalendar({ id });
  };

  /**
   * Deletes a specific habit and all its completion records
   * Updates positions of remaining habits in the calendar
   *
   * @param id - Habit ID to delete
   */
  const handleDeleteHabit = async (id: Id<"habits">) => {
    await deleteHabit({ id });
  };

  /**
   * Toggles habit completion status for a specific date
   * Supports multiple completions per day with count parameter
   * Automatically handles adding/removing completion records
   *
   * @param habitId - Habit to toggle completion for
   * @param date - ISO date string (YYYY-MM-DD) for the completion
   * @param count - Target number of completions (0 removes all completions)
   */
  const handleToggleHabit = async (
    habitId: Id<"habits">,
    date: string,
    count: number,
  ) => {
    // Check if the completion is for today
    const today = new Date().toISOString().split("T")[0];
    const isToday = date === today;

    // Use current timestamp for today's completions, otherwise use the date's timestamp
    const timestamp = isToday ? Date.now() : new Date(date).getTime();

    await markComplete({
      habitId,
      completedAt: timestamp,
      count,
    });
  };

  // Loading state indicates if any required data is still being fetched
  // This helps prevent UI flicker and incomplete data display
  const isLoading =
    calendarsQuery === undefined ||
    habitsQuery === undefined ||
    completionsQuery === undefined;

  return {
    isAuthenticated,
    isLoading,
    isLoadingMore,
    calendars: calendarsQuery,
    habits: habitsQuery,
    completions: allCompletions,
    hasMoreCompletions: completionsQuery?.hasMore ?? false,
    loadMoreCompletions,
    handleAddCalendar,
    handleAddHabit,
    handleEditCalendar,
    handleEditHabit,
    handleDeleteCalendar,
    handleDeleteHabit,
    handleToggleHabit,
  };
}
