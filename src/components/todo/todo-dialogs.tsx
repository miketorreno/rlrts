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
import { TodoCadence } from "@/lib/todos";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface NewTodoDialogProps {
  cadence: TodoCadence;
  isOpen: boolean;
  items: string[];
  name: string;
  onCadenceChange: (cadence: TodoCadence) => void;
  onItemsChange: (items: string[]) => void;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onXpChange: (xp: number) => void;
  onSubmit: () => void;
  xp: number;
}

export const NewTodoDialog = ({
  cadence,
  isOpen,
  items,
  name,
  onCadenceChange,
  onItemsChange,
  onNameChange,
  onOpenChange,
  onXpChange,
  onSubmit,
  xp,
}: NewTodoDialogProps) => {
  const t = useTranslations("dialogs.todo.new");
  const tTodo = useTranslations("todo");

  const updateItem = (index: number, value: string) => {
    onItemsChange(items.map((item, i) => (i === index ? value : item)));
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    onItemsChange([...items, ""]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="todo-name">{t("name.label")}</Label>
            <Input
              id="todo-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={t("name.placeholder")}
            />
          </div>
          <div>
            <Label>{t("cadence.label")}</Label>
            <Select
              value={cadence}
              onValueChange={(value) => onCadenceChange(value as TodoCadence)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("cadence.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{tTodo("daily")}</SelectItem>
                <SelectItem value="weekly">{tTodo("weekly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="todo-xp">{t("xp.label")}</Label>
            <Input
              id="todo-xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>{t("items.label")}</Label>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder={t("items.placeholder")}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("items.remove")}
                    onClick={() => removeItem(index)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus />
                {t("items.add")}
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("actions.cancel")}
            </Button>
            <Button onClick={onSubmit} className="flex-1">
              {t("actions.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditTodoDialogProps {
  cadence: TodoCadence;
  isOpen: boolean;
  items: Doc<"todoItems">[];
  name: string;
  onAddItem: (name: string) => void;
  onCadenceChange: (cadence: TodoCadence) => void;
  onNameChange: (name: string) => void;
  onOpenChange: (open: boolean) => void;
  onRemoveItem: (itemId: Id<"todoItems">) => void;
  onSave: () => void;
  onXpChange: (xp: number) => void;
  xp: number;
}

export const EditTodoDialog = ({
  cadence,
  isOpen,
  items,
  name,
  onAddItem,
  onCadenceChange,
  onNameChange,
  onOpenChange,
  onRemoveItem,
  onSave,
  onXpChange,
  xp,
}: EditTodoDialogProps) => {
  const t = useTranslations("dialogs.todo.edit");
  const tTodo = useTranslations("todo");
  const [newItemName, setNewItemName] = useState("");

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim());
    setNewItemName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="edit-todo-name">{t("name.label")}</Label>
            <Input
              id="edit-todo-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("cadence.label")}</Label>
            <Select
              value={cadence}
              onValueChange={(value) => onCadenceChange(value as TodoCadence)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("cadence.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{tTodo("daily")}</SelectItem>
                <SelectItem value="weekly">{tTodo("weekly")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-todo-xp">{t("xp.label")}</Label>
            <Input
              id="edit-todo-xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>{t("items.label")}</Label>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-2">
                  <span
                    className={
                      item.isCompleted
                        ? "text-sm text-muted-foreground line-through"
                        : "text-sm"
                    }
                  >
                    {item.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="ms-auto"
                    aria-label={t("items.remove")}
                    onClick={() => onRemoveItem(item._id)}
                  >
                    <X />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddItem();
                  }}
                  placeholder={t("items.addPlaceholder")}
                />
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  {t("items.add")}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t("actions.cancel")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("actions.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
