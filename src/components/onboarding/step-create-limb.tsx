"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateLimbProps {
  trunkId: string | null;
  onComplete: (limbId: string) => void;
  onSkip: () => void;
}

export function StepCreateLimb({ trunkId, onComplete, onSkip }: StepCreateLimbProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const createLimb = useMutation(api.limbs.create);

  const handleSubmit = async () => {
    if (!name.trim() || !trunkId) return;
    const id = await createLimb({ name: name.trim(), trunkId: trunkId as never });
    onComplete(id);
  };

  if (!trunkId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("goBack")}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{t("limbDescription")}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="limb-name">{t("limbName")}</Label>
        <Input
          id="limb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("limbPlaceholder")}
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
