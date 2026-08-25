"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface NewLimbDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const NewLimbDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onSubmit,
}: NewLimbDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("limb.new.title")}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="limb-name">
              {t("limb.new.name.label")}
            </FieldLabel>
            <Input
              id="limb-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("limb.new.name.placeholder")}
            />
          </Field>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("limb.new.actions.cancel")}
            </Button>
            <Button onClick={onSubmit} className="flex-1">
              {t("limb.new.actions.create")}
            </Button>
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
};

interface EditLimbDialogProps {
  isOpen: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onPositionChange: (position: number) => void;
  onSave: () => void;
  position: number;
  totalLimbs: number;
}

export const EditLimbDialog = ({
  isOpen,
  name,
  onNameChange,
  onOpenChange,
  onPositionChange,
  onSave,
  position,
  totalLimbs,
}: EditLimbDialogProps) => {
  const t = useTranslations("dialogs");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("limb.edit.title")}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-limb-name">
              {t("limb.edit.name.label")}
            </FieldLabel>
            <Input
              id="edit-limb-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>{t("limb.edit.position.label")}</FieldLabel>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("limb.edit.position.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalLimbs }, (_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("limb.edit.actions.cancel")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("limb.edit.actions.save")}
            </Button>
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
};
