/**
 * Custom hook for managing dialog states in the application.
 * Handles state for both twig and leaf dialogs including:
 * - New/Edit modal visibility
 * - Form data (name, color, duration)
 * - Selected/Editing items
 */
import { Twig, EditingTwig } from "@/types";
import { useCallback, useState } from "react";

/**
 * Interface defining the structure of dialog states
 * Includes separate states for twig and leaf dialogs
 */
interface TwigState {
  isNewOpen: boolean;
  isEditOpen: boolean;
  name: string;
  color: string;
  editingTwig: EditingTwig | null;
  position: number;
}

interface LeafState {
  isNewOpen: boolean;
  name: string;
  timerDuration?: number;
  selectedTwig: Twig | null;
}

interface DialogState {
  twig: TwigState;
  leaf: LeafState;
}

const initialState: DialogState = {
  twig: {
    isNewOpen: false,
    isEditOpen: false,
    name: "",
    color: "bg-red-500",
    editingTwig: null,
    position: 1,
  },
  leaf: {
    isNewOpen: false,
    name: "",
    timerDuration: undefined,
    selectedTwig: null,
  },
};

/**
 * Hook for managing dialog states and actions
 * Provides functions for opening dialogs and updating form values
 */
export function useDialogState() {
  const [state, setState] = useState<DialogState>(initialState);

  /**
   * Resets twig dialog state to initial values
   */
  const resetTwigState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      twig: {
        ...initialState.twig,
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
   * Opens the new twig dialog
   */
  const openNewTwig = useCallback(() => {
    setState((prev) => ({
      ...prev,
      twig: { ...prev.twig, isNewOpen: true },
    }));
  }, []);

  /**
   * Opens the edit twig dialog with existing twig data
   */
  const openEditTwig = useCallback((twig: EditingTwig) => {
    setState((prev) => ({
      ...prev,
      twig: {
        ...prev.twig,
        isEditOpen: true,
        editingTwig: twig,
        name: twig.name,
        color: twig.colorTheme,
        position: twig.position ?? 1,
      },
    }));
  }, []);

  /**
   * Opens the new leaf dialog with selected twig
   */
  const openNewLeaf = useCallback((twig: Twig) => {
    setState((prev) => ({
      ...prev,
      leaf: {
        ...prev.leaf,
        isNewOpen: true,
        selectedTwig: twig,
      },
    }));
  }, []);

  /**
   * Updates twig name in state
   */
  const updateTwigName = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      twig: { ...prev.twig, name },
    }));
  }, []);

  /**
   * Updates twig color theme in state
   */
  const updateTwigColor = useCallback((color: string) => {
    setState((prev) => ({
      ...prev,
      twig: { ...prev.twig, color },
    }));
  }, []);

  /**
   * Updates twig position in state
   */
  const updateTwigPosition = useCallback((position: number) => {
    setState((prev) => ({
      ...prev,
      twig: { ...prev.twig, position },
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
    openNewTwig,
    openEditTwig,
    openNewLeaf,
    updateTwigName,
    updateTwigColor,
    updateTwigPosition,
    updateLeafName,
    updateLeafTimer,
    resetTwigState,
    resetLeafState,
  };
}
