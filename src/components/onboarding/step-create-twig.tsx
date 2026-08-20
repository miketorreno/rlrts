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
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";

interface StepCreateTwigProps {
  branchId: string | null;
  onComplete: (twigId: string) => void;
  onSkip: () => void;
}

export function StepCreateTwig({ branchId, onComplete, onSkip }: StepCreateTwigProps) {
  const t = useTranslations("onboarding");
  const [name, setName] = useState("");
  const [colorTheme, setColorTheme] = useState("blue");
  const createTwig = useMutation(api.twigs.create);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const id = await createTwig({
      name: name.trim(),
      colorTheme,
      branchId: (branchId as never) ?? undefined,
    });
    onComplete(id);
  };

  if (!branchId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground">{t("skipMessage")}</p>
        <Button onClick={onSkip}>{t("goBack")}</Button>
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
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>{t("colorTheme")}</Label>
        <Select value={colorTheme} onValueChange={setColorTheme}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
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
            ].map((color) => (
              <SelectItem key={color} value={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} disabled={!name.trim()}>
        {t("createAndNext")}
      </Button>
    </div>
  );
}
