"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateTrunkProps {
  onComplete: (trunkId: string) => void;
  onSkip: () => void;
}

const COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export function StepCreateTrunk({
  onComplete,
  onSkip,
}: StepCreateTrunkProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [color, setColor] = useState("blue");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTrunk = useMutation(api.trunks.create);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const id = await createTrunk({ name: name.trim(), color });
      onComplete(id);
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("trunkColor")}</Label>
        <Select value={color} onValueChange={setColor} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLORS.map((c) => (
              <SelectItem key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSubmit} disabled={!name.trim() || isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {t("createAndNext")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={isSubmitting}
        >
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}
