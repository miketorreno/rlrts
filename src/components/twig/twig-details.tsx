"use client";

import { TwigBackNavigation } from "@/components/twig/details/twig-back-navigation";
import { TwigDeleteDialog } from "@/components/twig/details/twig-delete-dialog";
import { TwigEditForm } from "@/components/twig/details/twig-edit-form";
import { TwigLeavesList } from "@/components/twig/details/twig-leaves-list";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
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
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Fetch twig and associated data
  const twigs = useQuery(api.twigs.list);
  const twig = twigs?.find((c) => c._id === twigId);
  const leaves = useQuery(api.leaves.list, { twigId });

  // State for form fields
  const [name, setName] = useState(twig?.name ?? "");
  const [colorTheme, setColorTheme] = useState(
    twig?.colorTheme ?? "bg-red-500",
  );
  const [position, setPosition] = useState<number>(twig?.position ?? 1);

  // Update form fields when twig data changes
  useEffect(() => {
    if (twig) {
      setName(twig.name);
      setColorTheme(twig.colorTheme);
      setPosition(twig.position ?? 1);
    }
  }, [twig]);

  // Sort twigs by position to ensure correct order
  const sortedTwigs =
    twigs?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) ?? [];

  // Mutations
  const updateTwig = useMutation(api.twigs.update);
  const deleteTwig = useMutation(api.twigs.remove);

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
    try {
      setShowDeleteAlert(false);
      router.replace("/twig");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await deleteTwig({ id: twigId });
      toast({ description: "Twig deleted", variant: "destructive" });
    } catch (error) {
      toast({
        description: `Failed to delete twig: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
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
    </>
  );
}
