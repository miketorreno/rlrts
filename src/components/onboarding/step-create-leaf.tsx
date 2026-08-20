"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateLeafProps {
  twigId: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

export function StepCreateLeaf({ twigId, onComplete, onSkip }: StepCreateLeafProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const createLeaf = useMutation(api.leaves.create);

  const handleSubmit = async () => {
    if (!name.trim() || !twigId) return;
    await createLeaf({ name: name.trim(), twigId: twigId as never });
    onComplete();
  };

  if (!twigId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("goBack")}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{t("leafDescription")}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="leaf-name">{t("leafName")}</Label>
        <Input
          id="leaf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("leafPlaceholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!name.trim()}>
        {t("done")}
      </Button>
    </div>
  );
}
