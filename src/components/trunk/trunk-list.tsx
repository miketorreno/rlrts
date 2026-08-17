"use client";

import {
  EditTrunkDialog,
  NewTrunkDialog,
} from "@/components/trunk/trunk-dialogs";
import { TrunkItem } from "@/components/trunk/trunk-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useMutation } from "convex/react";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";

interface TrunkListProps {
  trunks?: Doc<"trunks">[];
}

export function TrunkList({ trunks }: TrunkListProps) {
  const t = useTranslations("trunks");
  const tNav = useTranslations("nav");
  const toastMessages = useToastMessages();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Doc<"trunks"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState(1);

  const createTrunk = useMutation(api.trunks.create);
  const updateTrunk = useMutation(api.trunks.update);

  const sortedTrunks = useMemo(
    () =>
      [...(trunks ?? [])].sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
    [trunks],
  );

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    await createTrunk({ name: newName.trim() });
    toastMessages.trunk.created();
    setNewOpen(false);
    setNewName("");
  }, [createTrunk, newName, toastMessages]);

  const openEdit = useCallback(
    (trunk: Doc<"trunks">) => {
      setEditingTrunk(trunk);
      setEditName(trunk.name);
      setEditPosition(
        trunk.position ??
          sortedTrunks.findIndex((item) => item._id === trunk._id) + 1,
      );
      setEditOpen(true);
    },
    [sortedTrunks],
  );

  const handleSave = useCallback(async () => {
    if (!editingTrunk || !editName.trim()) return;
    await updateTrunk({
      id: editingTrunk._id,
      name: editName.trim(),
      position: editPosition,
    });
    toastMessages.trunk.updated();
    setEditOpen(false);
    setEditingTrunk(null);
  }, [editingTrunk, editName, editPosition, updateTrunk, toastMessages]);

  let content;
  if (trunks === undefined) {
    content = (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl border p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  } else if (sortedTrunks.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-16">
        <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        <Button variant="outline" onClick={() => setNewOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          {t("addTrunk")}
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{tNav("trunks")}</h1>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {sortedTrunks.length}
            </span>
          </div>
          <Button onClick={() => setNewOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            {t("addTrunk")}
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {sortedTrunks.map((trunk) => (
            <TrunkItem key={trunk._id} trunk={trunk} onEdit={() => openEdit(trunk)} />
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {content}
      <NewTrunkDialog
        isOpen={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setNewName("");
        }}
        name={newName}
        onNameChange={setNewName}
        onSubmit={handleCreate}
      />
      <EditTrunkDialog
        isOpen={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingTrunk(null);
        }}
        name={editName}
        onNameChange={setEditName}
        position={editPosition}
        onPositionChange={setEditPosition}
        totalTrunks={sortedTrunks.length}
        onSave={handleSave}
      />
    </>
  );
}
