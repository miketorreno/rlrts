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
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useRouter } from "@/i18n/routing";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";

interface LimbItemProps {
  limb: Doc<"limbs">;
  onEdit: () => void;
}

export function LimbItem({ limb, onEdit }: LimbItemProps) {
  const t = useTranslations("limbs");
  const tDialogs = useTranslations("dialogs");
  const toastMessages = useToastMessages();
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const removeLimb = useMutation(api.limbs.remove);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await removeLimb({ id: limb._id });
      toastMessages.limb.deleted();
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }, [removeLimb, limb._id, toastMessages]);

  return (
    <>
      <Card className="border p-2 shadow-md">
        <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <h2 className="text-lg font-semibold">{limb.name}</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/branches?limbId=${limb._id}`)}
            >
              {t("viewBranches")}
            </Button>
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
