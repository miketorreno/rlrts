import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

// import { api } from "@server/convex/_generated/api";
// import { Doc, Id } from "@server/convex/_generated/dataModel";

/**
 * Custom hook for managing twig-related data and operations in a leaf tracking application.
 * Centralizes all twig, leaf, and completion data access and mutations in one place.
 *
 * Key features:
 * - Handles authentication state and skips queries when not authenticated
 * - Provides CRUD operations for twigs and leaves
 * - Manages leaf completion tracking with support for multiple completions per day
 * - Handles date range-based queries for completion history
 *
 * @param startDate - Beginning of the date range for fetching completions
 * @param endDate - End of the date range for fetching completions
 *
 * Note: All database operations are authenticated and will fail if user is not logged in
 */
export function useTwigData(startDate: Date, endDate: Date) {
  const { isAuthenticated } = useConvexAuth();
  const [allCompletions, setAllCompletions] = useState<Doc<"completions">[]>(
    [],
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // --- Database Queries ---

  /**
   * Fetches all twigs owned by the authenticated user
   * Returns undefined if not authenticated, empty array if no twigs exist
   * Twigs are ordered by their position field
   */
  const twigsQuery = useQuery(api.twigs.list, isAuthenticated ? {} : "skip");

  /**
   * Fetches all leaves across all twigs for the authenticated user
   * Setting twigId to undefined retrieves leaves from all twigs
   * Leaves are ordered by their position within each twig
   */
  const leavesQuery = useQuery(
    api.leaves.list,
    isAuthenticated ? { twigId: undefined } : "skip",
  );

  /**
   * Fetches paginated leaf completion records within the specified date range
   * Converts JavaScript Date objects to Unix timestamps for the database query
   * Returns a paginated response with completions array and pagination metadata
   */
  const completionsQuery = useQuery(
    api.leaves.getCompletions,
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
    api.leaves.getCompletions,
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
  const createTwig = useMutation(api.twigs.create);
  const createLeaf = useMutation(api.leaves.create);
  const markComplete = useMutation(api.leaves.markComplete);
  const updateTwig = useMutation(api.twigs.update);
  const updateLeaf = useMutation(api.leaves.update);
  const deleteTwig = useMutation(api.twigs.remove);
  const deleteLeaf = useMutation(api.leaves.remove);

  /**
   * Creates a new twig for the authenticated user
   * Validates input and prevents empty twig names
   * Position is automatically assigned based on existing twigs
   *
   * @param name - Display name for the twig (must be non-empty)
   * @param colorTheme - Theme identifier for styling (e.g., "bg-red-500")
   */
  const handleAddTwig = async (name: string, colorTheme: string) => {
    if (!name.trim()) return;
    await createTwig({
      name,
      colorTheme,
    });
  };

  /**
   * Creates a new leaf within a specified twig
   * Validates input and prevents empty leaf names
   * Supports optional timer duration for timed leaves
   * Position is automatically assigned within the twig
   *
   * @param name - Display name for the leaf (must be non-empty)
   * @param twigId - Parent twig ID
   * @param timerDuration - Optional duration in minutes for timed leaves
   */
  const handleAddLeaf = async (
    name: string,
    twigId: Id<"twigs">,
    timerDuration?: number,
  ) => {
    if (!name.trim()) return;
    await createLeaf({
      name,
      twigId,
      timerDuration,
    });
  };

  /**
   * Updates an existing twig's properties
   * Validates input and prevents empty twig names
   * Updates position and maintains order of other twigs
   *
   * @param id - Twig ID to update
   * @param name - New display name (must be non-empty)
   * @param colorTheme - New theme identifier
   * @param position - New position in the twig list
   */
  const handleEditTwig = async (
    id: Id<"twigs">,
    name: string,
    colorTheme: string,
    position: number,
  ) => {
    if (!name.trim()) return;
    await updateTwig({
      id,
      name,
      colorTheme,
      position,
    });
  };

  /**
   * Updates an existing leaf's properties
   * Validates input and prevents empty leaf names
   * Maintains the leaf's twig association
   *
   * @param id - Leaf ID to update
   * @param name - New display name (must be non-empty)
   * @param timerDuration - New timer duration in minutes (optional)
   */
  const handleEditLeaf = async (
    id: Id<"leaves">,
    name: string,
    timerDuration?: number,
  ) => {
    if (!name.trim()) return;
    const leaf = leavesQuery?.find((l) => l._id === id);
    if (!leaf) return;

    await updateLeaf({
      id,
      name,
      timerDuration,
      twigId: leaf.twigId,
    });
  };

  /**
   * Deletes a twig and cascades deletion to all associated leaves
   * Also removes all completion records for the deleted leaves
   *
   * @param id - Twig ID to delete
   */
  const handleDeleteTwig = async (id: Id<"twigs">) => {
    await deleteTwig({ id });
  };

  /**
   * Deletes a specific leaf and all its completion records
   * Updates positions of remaining leaves in the twig
   *
   * @param id - Leaf ID to delete
   */
  const handleDeleteLeaf = async (id: Id<"leaves">) => {
    await deleteLeaf({ id });
  };

  /**
   * Toggles leaf completion status for a specific date
   * Supports multiple completions per day with count parameter
   * Automatically handles adding/removing completion records
   *
   * @param leafId - Leaf to toggle completion for
   * @param date - ISO date string (YYYY-MM-DD) for the completion
   * @param count - Target number of completions (0 removes all completions)
   */
  const handleToggleLeaf = async (
    leafId: Id<"leaves">,
    date: string,
    count: number,
  ) => {
    // Check if the completion is for today
    const today = new Date().toISOString().split("T")[0];
    const isToday = date === today;

    // Use current timestamp for today's completions, otherwise use the date's timestamp
    const timestamp = isToday ? Date.now() : new Date(date).getTime();

    await markComplete({
      leafId,
      completedAt: timestamp,
      count,
    });
  };

  // Loading state indicates if any required data is still being fetched
  // This helps prevent UI flicker and incomplete data display
  const isLoading =
    twigsQuery === undefined ||
    leavesQuery === undefined ||
    completionsQuery === undefined;

  return {
    isAuthenticated,
    isLoading,
    isLoadingMore,
    twigs: twigsQuery,
    leaves: leavesQuery,
    completions: allCompletions,
    hasMoreCompletions: completionsQuery?.hasMore ?? false,
    loadMoreCompletions,
    handleAddTwig,
    handleAddLeaf,
    handleEditTwig,
    handleEditLeaf,
    handleDeleteTwig,
    handleDeleteLeaf,
    handleToggleLeaf,
  };
}
