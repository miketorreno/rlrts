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

interface StepCreateTwigProps {
  branchId: string | null;
  onComplete: (twigId: string) => void;
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

export function StepCreateTwig({
  branchId,
  onComplete,
  onSkip,
}: StepCreateTwigProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [colorTheme, setColorTheme] = useState("blue");
  const [twigType, setTwigType] = useState<"once" | "many">("many");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createTwig = useMutation(api.twigs.create);

  const handleSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const id = await createTwig({
        name: name.trim(),
        colorTheme,
        type: twigType,
        branchId: (branchId as never) ?? undefined,
      });
      onComplete(id);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!branchId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("continueWithout")}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">{t("twigDescription")}</p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="twig-name">{t("twigName")}</Label>
        <Input
          id="twig-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("twigPlaceholder")}
          disabled={isSubmitting}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("twigType")}</Label>
        <Select
          value={twigType}
          onValueChange={(v) => setTwigType(v as "once" | "many")}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">{t("twigTypeOnce")}</SelectItem>
            <SelectItem value="many">{t("twigTypeMany")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("colorTheme")}</Label>
        <Select
          value={colorTheme}
          onValueChange={setColorTheme}
          disabled={isSubmitting}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLORS.map((color) => (
              <SelectItem key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
