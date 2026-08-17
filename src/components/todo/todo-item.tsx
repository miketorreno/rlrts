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
import { useMutation } from "convex/react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface TodoItemProps {
  items: Doc<"todoItems">[];
  onEdit: () => void;
  todo: Doc<"todos">;
}

export function TodoItem({ items, onEdit, todo }: TodoItemProps) {
  const t = useTranslations("todo");
  const tXp = useTranslations("xp");
  const tDialogs = useTranslations("dialogs");
  const toastMessages = useToastMessages();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const toggleItem = useMutation(api.todos.toggleItem);
  const removeTodo = useMutation(api.todos.remove);

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
    [items],
  );

  const completedCount = sortedItems.filter((item) => item.isCompleted).length;

  const handleToggle = useCallback(
    async (itemId: Id<"todoItems">) => {
      setToggling(true);
      try {
        await toggleItem({ todoId: todo._id, itemId });
      } catch (error) {
        console.error(error);
      } finally {
        setToggling(false);
      }
    },
    [toggleItem, todo._id],
  );

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await removeTodo({ id: todo._id });
      toastMessages.todo.deleted();
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  }, [removeTodo, todo._id, toastMessages]);

  return (
    <>
      <Card className="border p-2 shadow-md">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{todo.name}</h2>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {t(todo.cadence)}
              </span>
              <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                {tXp("label")} {todo.xp}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2">
              <span className="text-sm text-muted-foreground">
                {t("progress", { done: completedCount, total: items.length })}
              </span>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Pencil />
                {t("edit")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 />
                {t("delete")}
              </Button>
            </div>
          </div>
          {sortedItems.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {sortedItems.map((item) => (
                <li key={item._id}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      disabled={toggling}
                      onChange={() => handleToggle(item._id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span
                      className={
                        item.isCompleted
                          ? "text-sm text-muted-foreground line-through"
                          : "text-sm"
                      }
                    >
                      {item.name}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tDialogs("todo.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tDialogs("todo.deleteConfirm.description", { name: todo.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteOpen(false)}>
              {tDialogs("todo.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {tDialogs("todo.deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
