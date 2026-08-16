"use client";

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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewTwigDialog } from "@/components/twig/twig-dialogs";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

/**
 * Per-branch twig listing with an inline "Add twig" flow.
 * Rendered once per branch row so that useQuery and the dialog state
 * are not called inside a loop (Rules of Hooks).
 */
function BranchTwigs({ branchId }: { branchId: Id<"branches"> }) {
  const t = useTranslations("branches");
  const toastMessages = useToastMessages();
  const router = useRouter();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("bg-red-500");

  const twigs = useQuery(api.twigs.list, { branchId });
  const createTwig = useMutation(api.twigs.create);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    await createTwig({ name: newName.trim(), colorTheme: newColor, branchId });
    toastMessages.twig.created();
    setNewOpen(false);
    setNewName("");
  }, [createTwig, newName, newColor, branchId, toastMessages]);

  let twigsContent;
  if (twigs === undefined) {
    twigsContent = <Skeleton className="h-5 w-40" />;
  } else if (twigs.length === 0) {
    twigsContent = (
      <p className="text-sm text-muted-foreground">{t("emptyTwigs")}</p>
    );
  } else {
    twigsContent = twigs.map((twig) => {
      const colorClass = twig.colorTheme.startsWith("bg-")
        ? twig.colorTheme
        : `bg-${twig.colorTheme}-500`;
      return (
        <button
          key={twig._id}
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-start transition-colors hover:bg-muted"
          onClick={() => router.push(`/twigs/${twig._id}`)}
        >
          <span className={`h-3 w-3 shrink-0 rounded-full ${colorClass}`} />
          <span className="text-sm">{twig.name}</span>
        </button>
      );
    });
  }

  return (
    <div className="flex flex-col gap-2 border-t pt-4">
      <div className="flex flex-col gap-1">{twigsContent}</div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => setNewOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          {t("addTwig")}
        </Button>
      </div>
      <NewTwigDialog
        isOpen={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setNewName("");
        }}
        name={newName}
        onNameChange={setNewName}
        color={newColor}
        onColorChange={setNewColor}
        onSubmit={handleCreate}
      />
    </div>
  );
}

interface BranchItemProps {
  branch: Doc<"branches">;
  onEdit: () => void;
}

export function BranchItem({ branch, onEdit }: BranchItemProps) {
  const t = useTranslations("branches");
  const tDialogs = useTranslations("dialogs");
  const toastMessages = useToastMessages();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const removeBranch = useMutation(api.branches.remove);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await removeBranch({ id: branch._id });
      toastMessages.branch.deleted();
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }, [removeBranch, branch._id, toastMessages]);

  return (
    <>
      <Card className="border p-2 shadow-md">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <h2 className="text-lg font-semibold">{branch.name}</h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                {t("edit")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                {t("delete")}
              </Button>
            </div>
          </div>
          <BranchTwigs branchId={branch._id} />
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tDialogs("branch.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tDialogs("branch.deleteConfirm.description", {
                name: branch.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              {tDialogs("branch.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {tDialogs("branch.deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
