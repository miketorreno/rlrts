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
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { useMutation } from "convex/react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
      <Card className="border-l-4 border-l-amber-500 rounded-xl shadow-sm transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="truncate">{limb.name}</CardTitle>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                  {tDialogs("limb.edit.title")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  {tDialogs("limb.deleteConfirm.title")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
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
