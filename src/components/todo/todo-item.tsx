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
import { useMutation, useQuery } from "convex/react";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { streakMultiplier } from "@/lib/xp";
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

  const xpProfile = useQuery(api.xp.getXpProfile);
  const multiplier = streakMultiplier(xpProfile?.currentStreak ?? 0);
  const effectiveXp = todo.xp * multiplier;

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
      <Card className="rounded-xl border p-3 shadow-sm transition-colors hover:bg-muted/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-medium">{todo.name}</h2>
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {t(todo.cadence)}
            </span>
            <span className="rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
              {tXp("label")} {todo.xp > 0 ? effectiveXp : 0}
              {todo.xp > 0 && multiplier > 1 && (
                <span className="ml-1 text-yellow-700 dark:text-yellow-300">
                  (x{multiplier.toFixed(1)})
                </span>
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("progress", { done: completedCount, total: items.length })}
            </span>
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
