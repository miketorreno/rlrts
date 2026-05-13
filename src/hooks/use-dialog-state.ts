/**
 * Custom hook for managing dialog states in the application.
 * Handles state for both calendar and leaf dialogs including:
 * - New/Edit modal visibility
 * - Form data (name, color, duration)
 * - Selected/Editing items
 */
import { Calendar, EditingCalendar } from "@/types";
import { useCallback, useState } from "react";

/**
 * Interface defining the structure of dialog states
 * Includes separate states for calendar and leaf dialogs
 */
interface CalendarState {
  isNewOpen: boolean;
  isEditOpen: boolean;
  name: string;
  color: string;
  editingCalendar: EditingCalendar | null;
  position: number;
}

interface LeafState {
  isNewOpen: boolean;
  name: string;
  timerDuration?: number;
  selectedCalendar: Calendar | null;
}

interface DialogState {
  calendar: CalendarState;
  leaf: LeafState;
}

const initialState: DialogState = {
  calendar: {
    isNewOpen: false,
    isEditOpen: false,
    name: "",
    color: "bg-red-500",
    editingCalendar: null,
    position: 1,
  },
  leaf: {
    isNewOpen: false,
    name: "",
    timerDuration: undefined,
    selectedCalendar: null,
  },
};

/**
 * Hook for managing dialog states and actions
 * Provides functions for opening dialogs and updating form values
 */
export function useDialogState() {
  const [state, setState] = useState<DialogState>(initialState);

  /**
   * Resets calendar dialog state to initial values
   */
  const resetCalendarState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      calendar: {
        ...initialState.calendar,
      },
    }));
  }, []);

  /**
   * Resets leaf dialog state to initial values
   */
  const resetLeafState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      leaf: {
        ...initialState.leaf,
      },
    }));
  }, []);

  /**
   * Opens the new calendar dialog
   */
  const openNewCalendar = useCallback(() => {
    setState((prev) => ({
      ...prev,
      calendar: { ...prev.calendar, isNewOpen: true },
    }));
  }, []);

  /**
   * Opens the edit calendar dialog with existing calendar data
   */
  const openEditCalendar = useCallback((calendar: EditingCalendar) => {
    setState((prev) => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        isEditOpen: true,
        editingCalendar: calendar,
        name: calendar.name,
        color: calendar.colorTheme,
        position: calendar.position ?? 1,
      },
    }));
  }, []);

  /**
   * Opens the new leaf dialog with selected calendar
   */
  const openNewLeaf = useCallback((calendar: Calendar) => {
    setState((prev) => ({
      ...prev,
      leaf: {
        ...prev.leaf,
        isNewOpen: true,
        selectedCalendar: calendar,
      },
    }));
  }, []);

  /**
   * Updates calendar name in state
   */
  const updateCalendarName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      calendar: { ...prev.calendar, name },
    }));
  }, []);

  /**
   * Updates calendar color theme in state
   */
  const updateCalendarColor = useCallback((color: string) => {
    setState((prev) => ({
      ...prev,
      calendar: { ...prev.calendar, color },
    }));
  }, []);

  /**
   * Updates calendar position in state
   */
  const updateCalendarPosition = useCallback((position: number) => {
    setState((prev) => ({
      ...prev,
      calendar: { ...prev.calendar, position },
    }));
  }, []);

  /**
   * Updates leaf name in state
   */
  const updateLeafName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      leaf: { ...prev.leaf, name },
    }));
  }, []);

  /**
   * Updates leaf timer duration in state
   */
  const updateLeafTimer = useCallback((timerDuration: number | undefined) => {
    setState((prev) => ({
      ...prev,
      leaf: { ...prev.leaf, timerDuration },
    }));
  }, []);

  return {
    state,
    openNewCalendar,
    openEditCalendar,
    openNewLeaf,
    updateCalendarName,
    updateCalendarColor,
    updateCalendarPosition,
    updateLeafName,
    updateLeafTimer,
    resetCalendarState,
    resetLeafState,
  };
}
