"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

/**
 * Dialog components for managing branches.
 * Provides a name-only create dialog and an edit dialog with name and position (reorder) fields.
 */

interface NewBranchDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const NewBranchDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onSubmit,
}: NewBranchDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("branch.new.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="branch-name">{t("branch.new.name.label")}</Label>
            <Input
              id="branch-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("branch.new.name.placeholder")}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("branch.new.actions.cancel")}
            </Button>
            <Button onClick={onSubmit} className="flex-1">
              {t("branch.new.actions.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditBranchDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onPositionChange: (position: number) => void;
  onSave: () => void;
  position: number;
  totalBranches: number;
}

export const EditBranchDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onPositionChange,
  onSave,
  position,
  totalBranches,
}: EditBranchDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("branch.edit.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="edit-branch-name">
              {t("branch.edit.name.label")}
            </Label>
            <Input
              id="edit-branch-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("branch.edit.position.label")}</Label>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("branch.edit.position.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalBranches }, (_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("branch.edit.actions.cancel")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("branch.edit.actions.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
