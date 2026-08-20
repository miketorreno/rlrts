"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateBranchProps {
  limbId: string | null;
  onComplete: (branchId: string) => void;
  onSkip: () => void;
}

export function StepCreateBranch({
  limbId,
  onComplete,
  onSkip,
}: StepCreateBranchProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createBranch = useMutation(api.branches.create);

  const handleSubmit = async () => {
    if (!name.trim() || !limbId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const id = await createBranch({
        name: name.trim(),
        limbId: limbId as never,
      });
      onComplete(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!limbId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("continueWithout")}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{t("branchDescription")}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch-name">{t("branchName")}</Label>
        <Input
          id="branch-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("branchPlaceholder")}
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t("createAndNext")}
      </Button>
    </div>
  );
}
