/**
 * Custom hook for managing dialog states in the application.
 * Handles state for both calendar and habit dialogs including:
 * - New/Edit modal visibility
 * - Form data (name, color, duration)
 * - Selected/Editing items
 */
import { Calendar, EditingCalendar } from "@/types";
import { useCallback, useState } from "react";

/**
 * Interface defining the structure of dialog states
 * Includes separate states for calendar and habit dialogs
 */
interface CalendarState {
  isNewOpen: boolean;
  isEditOpen: boolean;
  name: string;
  color: string;
  editingCalendar: EditingCalendar | null;
  position: number;
}

interface HabitState {
  isNewOpen: boolean;
  name: string;
  timerDuration?: number;
  selectedCalendar: Calendar | null;
}

interface DialogState {
  calendar: CalendarState;
  habit: HabitState;
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
  habit: {
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
   * Resets habit dialog state to initial values
   */
  const resetHabitState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      habit: {
        ...initialState.habit,
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
   * Opens the new habit dialog with selected calendar
   */
  const openNewHabit = useCallback((calendar: Calendar) => {
    setState((prev) => ({
      ...prev,
      habit: {
        ...prev.habit,
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
   * Updates habit name in state
   */
  const updateHabitName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      habit: { ...prev.habit, name },
    }));
  }, []);

  /**
   * Updates habit timer duration in state
   */
  const updateHabitTimer = useCallback((timerDuration: number | undefined) => {
    setState((prev) => ({
      ...prev,
      habit: { ...prev.habit, timerDuration },
    }));
  }, []);

  return {
    state,
    openNewCalendar,
    openEditCalendar,
    openNewHabit,
    updateCalendarName,
    updateCalendarColor,
    updateCalendarPosition,
    updateHabitName,
    updateHabitTimer,
    resetCalendarState,
    resetHabitState,
  };
}
