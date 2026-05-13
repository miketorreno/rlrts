import { useToast } from "@/hooks/use-toast";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useState } from "react";
import { api } from "../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";

/**
 * Custom hook for handling twig data import/export functionality.
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
  const twigsAndLeaves = useQuery(
    api.twig_sync.exportTwigsAndLeaves,
    isAuthenticated ? undefined : "skip",
  );
  const completions = useQuery(
    api.twig_sync.exportCompletions,
    isAuthenticated ? undefined : "skip",
  );

  const handleExportConfirm = async () => {
    setShowExportDialog(false);

    try {
      console.log("Starting export with:", {
        hasTwigs: !!twigsAndLeaves?.twigs,
        numTwigs: twigsAndLeaves?.twigs?.length,
        hasCompletions: !!completions?.completionsByLeaf,
        completionsKeys: completions?.completionsByLeaf
          ? Object.keys(completions.completionsByLeaf)
          : [],
      });

      const data = await new Promise((resolve, reject) => {
        let attempts = 0;
        const checkData = () => {
          attempts++;
          if (attempts > 80) {
            reject(
              new Error(
                !twigsAndLeaves?.twigs
                  ? "Failed to fetch twigs"
                  : "Failed to fetch completions",
              ),
            );
            return;
          }

          if (twigsAndLeaves?.twigs && completions?.completionsByLeaf) {
            if (!twigsAndLeaves.twigs.length) {
              reject(new Error("No twigs found to export"));
              return;
            }

            resolve({
              twigs: twigsAndLeaves.twigs.map((twig) => ({
                ...twig,
                leaves: twig.leaves.map((leaf) => ({
                  name: leaf.name,
                  position: leaf.position,
                  timerDuration: leaf.timerDuration,
                  completions:
                    completions.completionsByLeaf[
                      encodeURIComponent(leaf.name)
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
      a.download = `streak-twig-export-${format(new Date(), "yyyy-MM-dd")}.json`;
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

  const importData = useMutation(api.twig_sync.importData);

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
