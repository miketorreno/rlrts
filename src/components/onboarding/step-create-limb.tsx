"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateLimbProps {
  trunkId: string | null;
  onComplete: (limbId: string) => void;
  onSkip: () => void;
}

export function StepCreateLimb({
  trunkId,
  onComplete,
  onSkip,
}: StepCreateLimbProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createLimb = useMutation(api.limbs.create);

  const handleSubmit = async () => {
    if (!name.trim() || !trunkId || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const id = await createLimb({
        name: name.trim(),
        trunkId: trunkId as never,
        description: description.trim() || undefined,
      });
      onComplete(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!trunkId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("continueWithout")}</Button>
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
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="limb-description">{t("limbDescriptionLabel")}</Label>
        <Input
          id="limb-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("limbDescriptionPlaceholder")}
          disabled={isSubmitting}
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
