import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useImportExport } from "@/hooks/use-import-export";
import { ArrowUpDown, Download, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * ImportExport Component
 * Provides UI and functionality for importing and exporting calendar data
 * Uses a multi-dialog approach:
 * 1. Main dialog for choosing between import/export
 * 2. Confirmation dialogs for both import and export actions
 */

export function ImportExport() {
  const t = useTranslations("calendar.importExport");
  // Custom hook managing all import/export state and handlers
  const {
    handleExportConfirm, // Handles the actual export operation
    handleImportConfirm, // Handles the actual import operation
    handleImportSelect, // Handles file selection for import
    setImportFile, // Sets the file to be imported
    setShowExportDialog, // Controls export confirmation dialog
    setShowImportDialog, // Controls import confirmation dialog
    setShowImportExportDialog, // Controls main dialog visibility
    showExportDialog,
    showImportDialog,
    showImportExportDialog,
  } = useImportExport();

  return (
    <>
      {/* Main Dialog: Initial import/export selection screen */}
      <Dialog
        open={showImportExportDialog}
        onOpenChange={setShowImportExportDialog}
      >
        <DialogTrigger asChild>
          {/* TODO: 2025-01-04 - remove or add md:hidden back one day */}
          <Button variant="outline" className="flex">
            <ArrowUpDown className="h-4 w-4 bg-transparent" />
            {t("button")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              {/* Export button - Opens export confirmation dialog */}
              <Button onClick={() => setShowExportDialog(true)}>
                <Download className="h-4 w-4" />
                {t("export.button")}
              </Button>
              {/* Import button - Hidden file input with custom styled label */}
              <Button asChild>
                <label className="flex cursor-pointer items-center justify-center">
                  <Upload className="h-4 w-4" />
                  {t("import.button")}
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportSelect}
                  />
                </label>
              </Button>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowImportExportDialog(false)}
              >
                {t("import.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Confirmation Dialog */}
      <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("export.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("export.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("export.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleExportConfirm}>
              {t("export.continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Confirmation Dialog - Shown after file selection */}
      <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("import.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("import.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImportFile(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
