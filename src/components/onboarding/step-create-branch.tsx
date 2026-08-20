"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateBranchProps {
  limbId: string | null;
  onComplete: (branchId: string) => void;
  onSkip: () => void;
}

export function StepCreateBranch({ limbId, onComplete, onSkip }: StepCreateBranchProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const createBranch = useMutation(api.branches.create);

  const handleSubmit = async () => {
    if (!name.trim() || !limbId) return;
    const id = await createBranch({ name: name.trim(), limbId: limbId as never });
    onComplete(id);
  };

  if (!limbId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("goBack")}</Button>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!name.trim()}>
        {t("createAndNext")}
      </Button>
    </div>
  );
}
