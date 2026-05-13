"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLOR_VALUES } from "@/lib/colors";
import { useTranslations } from "next-intl";

interface TwigEditFormProps {
  name: string;
  onNameChange: (name: string) => void;
  colorTheme: string;
  onColorThemeChange: (color: string) => void;
  position: number;
  onPositionChange: (position: number) => void;
  totalTwigs: number;
  onSave: () => void;
  onDelete: () => void;
}

export function TwigEditForm({
  name,
  onNameChange,
  colorTheme,
  onColorThemeChange,
  position,
  onPositionChange,
  totalTwigs,
  onSave,
  onDelete,
}: TwigEditFormProps) {
  const t = useTranslations("dialogs");
  const tColors = useTranslations("dialogs.colors");

  const colors = COLOR_VALUES.map(({ key, value }) => ({
    name: tColors(key),
    value,
  }));

  return (
    <Card className="mx-auto my-8 max-w-xl border p-2 shadow-md">
      <div className="p-4">
        <h2 className="mb-6 text-lg font-semibold">{t("twig.edit.title")}</h2>
        <div className="space-y-4">
          {/* Twig name input field */}
          <div>
            <Label htmlFor="edit-twig-name">{t("twig.edit.name.label")}</Label>
            <Input
              id="edit-twig-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          {/* Color theme selection */}
          <div>
            <Label>{t("twig.edit.color.label")}</Label>
            <Select value={colorTheme} onValueChange={onColorThemeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("twig.edit.color.label")}>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${colorTheme}`} />
                    {colors.find((c) => c.value === colorTheme)?.name}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-40">
                {colors.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full ${c.value}`} />
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Position selection */}
          <div>
            <Label>{t("twig.edit.position.label")}</Label>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("twig.edit.position.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: totalTwigs }, (_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" onClick={onDelete}>
              {t("twig.edit.actions.delete")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("twig.edit.actions.save")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
