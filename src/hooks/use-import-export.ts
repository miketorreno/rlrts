import { useToast } from "@/hooks/use-toast";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";

/**
 * Custom hook for handling calendar data import/export functionality.
 * Manages dialog states and provides methods for importing/exporting JSON data.
 */

export function useImportExport() {
  const { isAuthenticated } = useConvexAuth();
  const { toast } = useToast();
  // Dialog visibility states
  const [showImportExportDialog, setShowImportExportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  // Currently selected file for import
  const [importFile, setImportFile] = useState<File | null>(null);

  // Fetch data when authenticated
  const calendarsAndHabits = useQuery(
    api.calendar_sync.exportCalendarsAndHabits,
    isAuthenticated ? undefined : "skip",
  );
  const completions = useQuery(
    api.calendar_sync.exportCompletions,
    isAuthenticated ? undefined : "skip",
  );

  const handleExportConfirm = async () => {
    setShowExportDialog(false);

    try {
      console.log("Starting export with:", {
        hasCalendars: !!calendarsAndHabits?.calendars,
        numCalendars: calendarsAndHabits?.calendars?.length,
        hasCompletions: !!completions?.completionsByHabit,
        completionsKeys: completions?.completionsByHabit
          ? Object.keys(completions.completionsByHabit)
          : [],
      });

      const data = await new Promise((resolve, reject) => {
        let attempts = 0;
        const checkData = () => {
          attempts++;
          if (attempts > 80) {
            reject(
              new Error(
                !calendarsAndHabits?.calendars
                  ? "Failed to fetch calendars"
                  : "Failed to fetch completions",
              ),
            );
            return;
          }

          if (
            calendarsAndHabits?.calendars &&
            completions?.completionsByHabit
          ) {
            if (!calendarsAndHabits.calendars.length) {
              reject(new Error("No calendars found to export"));
              return;
            }

            resolve({
              calendars: calendarsAndHabits.calendars.map((calendar) => ({
                ...calendar,
                habits: calendar.habits.map((habit) => ({
                  name: habit.name,
                  position: habit.position,
                  timerDuration: habit.timerDuration,
                  completions:
                    completions.completionsByHabit[
                      encodeURIComponent(habit.name)
                    ] || [],
                })),
              })),
            });
            return;
          }

          setTimeout(checkData, 100);
        };
        checkData();
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `streak-calendar-export-${format(new Date(), "yyyy-MM-dd")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create export file",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles file selection for import.
   * Updates the importFile state and shows the import confirmation dialog.
   */
  const handleImportSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setShowImportDialog(true);
    }
    e.target.value = "";
  };

  /**
   * Processes the selected file for import.
   * Validates JSON format and imports data using the API.
   * Shows success/error toast notifications based on the result.
   */
  const handleImportConfirm = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const data = JSON.parse(text);
      await importData({ data });
      toast({
        title: "Import successful",
        description: "Your data has been imported",
      });
    } catch {
      toast({
        title: "Import failed",
        description: "Invalid file format",
        variant: "destructive",
      });
    }
    setImportFile(null);
    setShowImportDialog(false);
  };

  const importData = useMutation(api.calendar_sync.importData);

  return {
    // Dialog visibility controls
    showImportExportDialog,
    setShowImportExportDialog,
    showExportDialog,
    setShowExportDialog,
    showImportDialog,
    setShowImportDialog,
    // Import file state
    importFile,
    setImportFile,
    // Handler functions
    handleExportConfirm,
    handleImportSelect,
    handleImportConfirm,
  };
}
