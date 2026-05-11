/**
 * Custom hook for managing calendar view state with localStorage persistence.
 * Handles switching between grid and row view layouts while preserving user preference.
 */
import { useCallback, useState } from "react";

/**
 * Type defining available calendar view modes
 * monthGrid: Traditional calendar grid layout
 * monthRow: Horizontal row-based layout
 */
type CalendarView = "monthGrid" | "monthRow";

/**
 * Hook for managing calendar view state
 * Provides functions for reading and updating the view mode
 * Persists view preference in localStorage
 */
export function useViewState() {
  // Initialize view state from localStorage or default to grid view
  const [localView, setLocalView] = useState<CalendarView>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("calendarView") as CalendarView) || "monthGrid";
    }
    return "monthGrid";
  });

  /**
   * Updates view state and persists to localStorage
   * Ensures view preference is saved between sessions
   */
  const setView = useCallback((newView: CalendarView) => {
    setLocalView(newView);
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarView", newView);
    }
  }, []);

  return { view: localView, setView };
}
