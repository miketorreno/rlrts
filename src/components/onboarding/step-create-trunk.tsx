"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateTrunkProps {
  onComplete: (trunkId: string) => void;
  onSkip: () => void;
}

export function StepCreateTrunk({
  onComplete,
  onSkip,
}: StepCreateTrunkProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const createTrunk = useMutation(api.trunks.create);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const id = await createTrunk({ name: name.trim() });
    onComplete(id);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{t("trunkDescription")}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="trunk-name">{t("trunkName")}</Label>
        <Input
          id="trunk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("trunkPlaceholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSubmit} disabled={!name.trim()}>
          {t("createAndNext")}
        </Button>
        <Button variant="ghost" size="sm" onClick={onSkip}>
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}
