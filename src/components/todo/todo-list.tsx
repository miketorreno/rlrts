"use client";

import {
  EditTodoDialog,
  NewTodoDialog,
} from "@/components/todo/todo-dialogs";
import { TodoItem } from "@/components/todo/todo-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { TodoCadence, useTodoPeriodRollover } from "@/lib/todos";
import { useMutation } from "convex/react";
import { ChevronDown, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface TodoListData {
  items: Doc<"todoItems">[];
  todos: Doc<"todos">[];
}

interface TodoListProps {
  data?: TodoListData;
}

const CADENCES: TodoCadence[] = ["daily", "weekly"];

export function TodoList({ data }: TodoListProps) {
  const t = useTranslations("todo");
  const tNav = useTranslations("nav");
  const toastMessages = useToastMessages();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCadence, setNewCadence] = useState<TodoCadence>("daily");
  const [newXp, setNewXp] = useState(10);
  const [newItems, setNewItems] = useState<string[]>([""]);

  const [editOpen, setEditOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Doc<"todos"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editCadence, setEditCadence] = useState<TodoCadence>("daily");
  const [editXp, setEditXp] = useState(10);

  const [collapsed, setCollapsed] = useState<Record<TodoCadence, boolean>>({
    daily: false,
    weekly: false,
  });

  const createTodo = useMutation(api.todos.create);
  const updateTodo = useMutation(api.todos.update);
  const addItem = useMutation(api.todos.addItem);
  const removeItem = useMutation(api.todos.removeItem);
  const resetPeriod = useMutation(api.todos.resetPeriod);

  useTodoPeriodRollover(resetPeriod);

  const sortedTodos = useMemo(
    () =>
      [...(data?.todos ?? [])].sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
    [data],
  );

  const groupedTodos = useMemo(() => {
    const groups: Record<TodoCadence, Doc<"todos">[]> = { daily: [], weekly: [] };
    for (const todo of sortedTodos) {
      groups[todo.cadence].push(todo);
    }
    return groups;
  }, [sortedTodos]);

  const itemsByTodo = useMemo(() => {
    const map = new Map<Id<"todos">, Doc<"todoItems">[]>();
    for (const item of data?.items ?? []) {
      const list = map.get(item.todoId) ?? [];
      list.push(item);
      map.set(item.todoId, list);
    }
    return map;
  }, [data]);

  const openCreate = useCallback((cadence: TodoCadence) => {
    setNewCadence(cadence);
    setNewName("");
    setNewItems([""]);
    setNewOpen(true);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    const items = newItems
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
    await createTodo({
      name: newName.trim(),
      cadence: newCadence,
      xp: newXp,
      items,
    });
    toastMessages.todo.created();
    setNewOpen(false);
    setNewName("");
    setNewItems([""]);
  }, [createTodo, newCadence, newItems, newName, newXp, toastMessages]);

  const openEdit = useCallback((todo: Doc<"todos">) => {
    setEditingTodo(todo);
    setEditName(todo.name);
    setEditCadence(todo.cadence);
    setEditXp(todo.xp);
    setEditOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingTodo || !editName.trim()) return;
    await updateTodo({
      id: editingTodo._id,
      name: editName.trim(),
      cadence: editCadence,
      xp: editXp,
    });
    toastMessages.todo.updated();
    setEditOpen(false);
    setEditingTodo(null);
  }, [editingTodo, editCadence, editName, editXp, updateTodo, toastMessages]);

  const handleAddItem = useCallback(
    async (todoId: Id<"todos">, name: string) => {
      await addItem({ todoId, name });
    },
    [addItem],
  );

  const handleRemoveItem = useCallback(
    async (itemId: Id<"todoItems">) => {
      await removeItem({ itemId });
    },
    [removeItem],
  );

  const toggleCadence = useCallback((cadence: TodoCadence) => {
    setCollapsed((prev) => ({ ...prev, [cadence]: !prev[cadence] }));
  }, []);

  let content;
  if (data === undefined) {
    content = (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl border p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-40" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  } else if (sortedTodos.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16">
        <p className="text-sm text-muted-foreground">{t("emptyAll")}</p>
        <Button variant="outline" onClick={() => openCreate("daily")}>
          <PlusCircle className="h-4 w-4" />
          {t("addTodo")}
        </Button>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col gap-2">
        {CADENCES.map((cadence) => {
          const sectionTodos = groupedTodos[cadence];
          const isCollapsed = collapsed[cadence];
          return (
            <div key={cadence}>
              <button
                type="button"
                onClick={() => toggleCadence(cadence)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start transition-colors hover:bg-muted"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
                <span className="text-base font-semibold">{t(cadence)}</span>
                <span className="text-sm text-muted-foreground">
                  ({sectionTodos.length})
                </span>
              </button>
              {!isCollapsed && (
                <div className="mt-2 flex flex-col gap-3 pb-4">
                  {sectionTodos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-8">
                      <p className="text-sm text-muted-foreground">
                        {t(cadence === "daily" ? "emptyDaily" : "emptyWeekly")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCreate(cadence)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        {t("addTodo")}
                      </Button>
                    </div>
                  ) : (
                    sectionTodos.map((todo) => (
                      <TodoItem
                        key={todo._id}
                        todo={todo}
                        items={itemsByTodo.get(todo._id) ?? []}
                        onEdit={() => openEdit(todo)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">{tNav("todos")}</h1>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {sortedTodos.length}
          </span>
        </div>
        <Button onClick={() => openCreate("daily")}>
          <PlusCircle className="h-4 w-4" />
          {t("addTodo")}
        </Button>
      </div>
      {content}
      <NewTodoDialog
        isOpen={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) {
            setNewName("");
            setNewItems([""]);
          }
        }}
        name={newName}
        onNameChange={setNewName}
        cadence={newCadence}
        onCadenceChange={setNewCadence}
        xp={newXp}
        onXpChange={setNewXp}
        items={newItems}
        onItemsChange={setNewItems}
        onSubmit={handleCreate}
      />
      <EditTodoDialog
        isOpen={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingTodo(null);
        }}
        name={editName}
        onNameChange={setEditName}
        cadence={editCadence}
        onCadenceChange={setEditCadence}
        xp={editXp}
        onXpChange={setEditXp}
        items={editingTodo ? itemsByTodo.get(editingTodo._id) ?? [] : []}
        onAddItem={(name) => {
          if (editingTodo) void handleAddItem(editingTodo._id, name);
        }}
        onRemoveItem={(itemId) => void handleRemoveItem(itemId)}
        onSave={handleSave}
      />
    </>
  );
}
