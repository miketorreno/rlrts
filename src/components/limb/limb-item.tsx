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
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { useMutation } from "convex/react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";

interface LimbItemProps {
  limb: Doc<"limbs">;
  onEdit: () => void;
}

export function LimbItem({ limb, onEdit }: LimbItemProps) {
  const tDialogs = useTranslations("dialogs");
  const { undoableDelete } = useUndoDelete();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const removeLimb = useMutation(api.limbs.remove);
  const createLimb = useMutation(api.limbs.create);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    setDeleteOpen(false);
    try {
      await undoableDelete(
        async () => { await removeLimb({ id: limb._id }); },
        limb,
        limb.name,
        async (item) => { await createLimb({ name: item.name, trunkId: item.trunkId }); },
      );
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }, [removeLimb, createLimb, limb, undoableDelete]);

  return (
    <>
      <Card className="rounded-xl border p-3 shadow-sm transition-colors hover:bg-muted/50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-medium">{limb.name}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tDialogs("limb.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tDialogs("limb.deleteConfirm.description", { name: limb.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              {tDialogs("limb.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {tDialogs("limb.deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
