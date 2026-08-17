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
 * Dialog components for managing trunks.
 * Provides a name-only create dialog and an edit dialog with name and position (reorder) fields.
 */

interface NewTrunkDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const NewTrunkDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onSubmit,
}: NewTrunkDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("trunk.new.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="trunk-name">{t("trunk.new.name.label")}</Label>
            <Input
              id="trunk-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("trunk.new.name.placeholder")}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("trunk.new.actions.cancel")}
            </Button>
            <Button onClick={onSubmit} className="flex-1">
              {t("trunk.new.actions.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditTrunkDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onPositionChange: (position: number) => void;
  onSave: () => void;
  position: number;
  totalTrunks: number;
}

export const EditTrunkDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onPositionChange,
  onSave,
  position,
  totalTrunks,
}: EditTrunkDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("trunk.edit.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="edit-trunk-name">{t("trunk.edit.name.label")}</Label>
            <Input
              id="edit-trunk-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("trunk.edit.position.label")}</Label>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("trunk.edit.position.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalTrunks }, (_, index) => (
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
              {t("trunk.edit.actions.cancel")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("trunk.edit.actions.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
