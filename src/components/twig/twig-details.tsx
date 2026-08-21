"use client";

import { TwigBackNavigation } from "@/components/twig/details/twig-back-navigation";
import { TwigDeleteDialog } from "@/components/twig/details/twig-delete-dialog";
import { TwigEditForm } from "@/components/twig/details/twig-edit-form";
import { TwigLeavesList } from "@/components/twig/details/twig-leaves-list";
import { useToast } from "@/hooks/use-toast";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

interface TwigDetailsProps {
  twigId: Id<"twigs">;
}

export function TwigDetails({ twigId }: TwigDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { undoableDelete } = useUndoDelete();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Fetch twig and associated data
  const twigs = useQuery(api.twigs.list, {});
  const twig = twigs?.find((c) => c._id === twigId);
  const leaves = useQuery(api.leaves.list, { twigId });

  // State for form fields
  const [name, setName] = useState(twig?.name ?? "");
  const [colorTheme, setColorTheme] = useState(
    twig?.colorTheme ?? "bg-red-500",
  );
  const [position, setPosition] = useState<number>(twig?.position ?? 1);

  // Update form fields when twig data changes
  const [prevTwig, setPrevTwig] = useState(twig);
  if (twig && twig !== prevTwig) {
    setPrevTwig(twig);
    setName(twig.name);
    setColorTheme(twig.colorTheme);
    setPosition(twig.position ?? 1);
  }

  // Sort twigs by position to ensure correct order
  const sortedTwigs =
    twigs?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) ?? [];

  // Mutations
  const updateTwig = useMutation(api.twigs.update);
  const deleteTwig = useMutation(api.twigs.remove);
  const createTwig = useMutation(api.twigs.create);

  if (!twig) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateTwig({
        id: twigId,
        name,
        colorTheme,
        position,
      });
      toast({ description: "Twig updated successfully" });
      router.push("/twig");
    } catch (error) {
      toast({
        description: `Failed to update twig: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    setShowDeleteAlert(false);
    router.replace("/twig");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await undoableDelete(
      async () => { await deleteTwig({ id: twigId }); },
      twig,
      name,
      async (item) => {
        const newId = await createTwig({
          name: item.name,
          colorTheme: item.colorTheme,
          branchId: item.branchId,
        });
        router.push(`/twigs/${newId}`);
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <TwigBackNavigation />

      <div className="text-center">
        <h1 className="mb-8 text-2xl font-bold">{name}</h1>
      </div>

      <TwigLeavesList leaves={leaves} />

      <TwigEditForm
        name={name}
        onNameChange={setName}
        colorTheme={colorTheme}
        onColorThemeChange={setColorTheme}
        position={position}
        onPositionChange={setPosition}
        totalTwigs={sortedTwigs.length}
        onSave={handleSave}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <TwigDeleteDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        twigName={name}
      />
    </div>
  );
}
