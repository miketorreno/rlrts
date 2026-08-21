"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateLeafProps {
  twigId: string | null;
  onComplete: () => void;
  onSkip: () => void;
}

export function StepCreateLeaf({
  twigId,
  onComplete,
  onSkip,
}: StepCreateLeafProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLeaf = useMutation(api.leaves.create);

  const handleSubmit = async () => {
    if (!name.trim() || !twigId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const parsed = targetCount ? parseInt(targetCount, 10) : undefined;
      await createLeaf({
        name: name.trim(),
        twigId: twigId as never,
        description: description.trim() || undefined,
        targetCount: parsed && parsed > 0 ? parsed : undefined,
      });
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!twigId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("continueWithout")}</Button>
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
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="leaf-description">{t("leafDescriptionLabel")}</Label>
        <Input
          id="leaf-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("leafDescriptionPlaceholder")}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="leaf-target">{t("leafTargetCount")}</Label>
        <Input
          id="leaf-target"
          type="number"
          min={1}
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
          placeholder={t("leafTargetCountPlaceholder")}
          disabled={isSubmitting}
        />
      </div>
      <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {t("done")}
      </Button>
    </div>
  );
}
