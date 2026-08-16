"use client";

import {
  EditLimbDialog,
  NewLimbDialog,
} from "@/components/limb/limb-dialogs";
import { LimbItem } from "@/components/limb/limb-item";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { useMutation } from "convex/react";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface LimbListProps {
  trunks?: Doc<"trunks">[];
  selectedTrunkId?: Id<"trunks"> | null;
  onTrunkChange: (trunkId: string) => void;
  limbs?: Doc<"limbs">[];
}

export function LimbList({
  trunks,
  selectedTrunkId,
  onTrunkChange,
  limbs,
}: LimbListProps) {
  const t = useTranslations("limbs");
  const toastMessages = useToastMessages();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingLimb, setEditingLimb] = useState<Doc<"limbs"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState(1);

  const createLimb = useMutation(api.limbs.create);
  const updateLimb = useMutation(api.limbs.update);

  const sortedLimbs = useMemo(
    () =>
      [...(limbs ?? [])].sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
    [limbs],
  );

  const handleCreate = useCallback(async () => {
    if (!newName.trim() || !selectedTrunkId) return;
    await createLimb({ name: newName.trim(), trunkId: selectedTrunkId });
    toastMessages.limb.created();
    setNewOpen(false);
    setNewName("");
  }, [createLimb, newName, selectedTrunkId, toastMessages]);

  const openEdit = useCallback(
    (limb: Doc<"limbs">) => {
      setEditingLimb(limb);
      setEditName(limb.name);
      setEditPosition(
        limb.position ??
          sortedLimbs.findIndex((item) => item._id === limb._id) + 1,
      );
      setEditOpen(true);
    },
    [sortedLimbs],
  );

  const handleSave = useCallback(async () => {
    if (!editingLimb || !editName.trim()) return;
    await updateLimb({
      id: editingLimb._id,
      name: editName.trim(),
      position: editPosition,
    });
    toastMessages.limb.updated();
    setEditOpen(false);
    setEditingLimb(null);
  }, [editingLimb, editName, editPosition, updateLimb, toastMessages]);

  let content;
  if (trunks === undefined) {
    content = (
      <Card className="border p-2 shadow-md">
        <div className="flex flex-col gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  } else if (!selectedTrunkId) {
    content = (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <p className="text-sm text-muted-foreground">{t("noTrunks")}</p>
      </div>
    );
  } else if (limbs === undefined) {
    content = (
      <Card className="border p-2 shadow-md">
        <div className="flex flex-col gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-40" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  } else if (sortedLimbs.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        <Button variant="default" onClick={() => setNewOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          {t("addLimb")}
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex flex-col gap-4">
          {sortedLimbs.map((limb) => (
            <LimbItem key={limb._id} limb={limb} onEdit={() => openEdit(limb)} />
          ))}
        </div>
        <div className="flex justify-center py-16">
          <Button variant="default" onClick={() => setNewOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            {t("addLimb")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {trunks && trunks.length > 0 && (
        <div className="mb-6">
          <Label>{t("selectTrunk")}</Label>
          <Select
            value={selectedTrunkId ?? undefined}
            onValueChange={onTrunkChange}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder={t("selectTrunk")} />
            </SelectTrigger>
            <SelectContent>
              {trunks.map((trunk) => (
                <SelectItem key={trunk._id} value={trunk._id}>
                  {trunk.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {content}
      <NewLimbDialog
        isOpen={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setNewName("");
        }}
        name={newName}
        onNameChange={setNewName}
        onSubmit={handleCreate}
      />
      <EditLimbDialog
        isOpen={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingLimb(null);
        }}
        name={editName}
        onNameChange={setEditName}
        position={editPosition}
        onPositionChange={setEditPosition}
        totalLimbs={sortedLimbs.length}
        onSave={handleSave}
      />
    </>
  );
}
