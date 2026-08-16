"use client";

import {
  EditBranchDialog,
  NewBranchDialog,
} from "@/components/branch/branch-dialogs";
import { BranchItem } from "@/components/branch/branch-item";
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

interface BranchListProps {
  limbs?: Doc<"limbs">[];
  selectedLimbId?: Id<"limbs"> | null;
  onLimbChange: (limbId: string) => void;
  branches?: Doc<"branches">[];
}

export function BranchList({
  limbs,
  selectedLimbId,
  onLimbChange,
  branches,
}: BranchListProps) {
  const t = useTranslations("branches");
  const toastMessages = useToastMessages();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Doc<"branches"> | null>(
    null,
  );
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState(1);

  const createBranch = useMutation(api.branches.create);
  const updateBranch = useMutation(api.branches.update);

  const sortedBranches = useMemo(
    () =>
      [...(branches ?? [])].sort(
        (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity),
      ),
    [branches],
  );

  const handleCreate = useCallback(async () => {
    if (!newName.trim() || !selectedLimbId) return;
    await createBranch({ name: newName.trim(), limbId: selectedLimbId });
    toastMessages.branch.created();
    setNewOpen(false);
    setNewName("");
  }, [createBranch, newName, selectedLimbId, toastMessages]);

  const openEdit = useCallback(
    (branch: Doc<"branches">) => {
      setEditingBranch(branch);
      setEditName(branch.name);
      setEditPosition(
        branch.position ??
          sortedBranches.findIndex((item) => item._id === branch._id) + 1,
      );
      setEditOpen(true);
    },
    [sortedBranches],
  );

  const handleSave = useCallback(async () => {
    if (!editingBranch || !editName.trim()) return;
    await updateBranch({
      id: editingBranch._id,
      name: editName.trim(),
      position: editPosition,
    });
    toastMessages.branch.updated();
    setEditOpen(false);
    setEditingBranch(null);
  }, [editingBranch, editName, editPosition, updateBranch, toastMessages]);

  let content;
  if (limbs === undefined) {
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
  } else if (!selectedLimbId) {
    content = (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <p className="text-sm text-muted-foreground">{t("noLimbs")}</p>
      </div>
    );
  } else if (branches === undefined) {
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
  } else if (sortedBranches.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center space-y-4 py-16">
        <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
        <Button variant="default" onClick={() => setNewOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          {t("addBranch")}
        </Button>
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex flex-col gap-4">
          {sortedBranches.map((branch) => (
            <BranchItem
              key={branch._id}
              branch={branch}
              onEdit={() => openEdit(branch)}
            />
          ))}
        </div>
        <div className="flex justify-center py-16">
          <Button variant="default" onClick={() => setNewOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            {t("addBranch")}
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      {limbs && limbs.length > 0 && (
        <div className="mb-6">
          <Label>{t("selectLimb")}</Label>
          <Select
            value={selectedLimbId ?? undefined}
            onValueChange={onLimbChange}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder={t("selectLimb")} />
            </SelectTrigger>
            <SelectContent>
              {limbs.map((limb) => (
                <SelectItem key={limb._id} value={limb._id}>
                  {limb.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {content}
      <NewBranchDialog
        isOpen={newOpen}
        onOpenChange={(open) => {
          setNewOpen(open);
          if (!open) setNewName("");
        }}
        name={newName}
        onNameChange={setNewName}
        onSubmit={handleCreate}
      />
      <EditBranchDialog
        isOpen={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditingBranch(null);
        }}
        name={editName}
        onNameChange={setEditName}
        position={editPosition}
        onPositionChange={setEditPosition}
        totalBranches={sortedBranches.length}
        onSave={handleSave}
      />
    </>
  );
}
