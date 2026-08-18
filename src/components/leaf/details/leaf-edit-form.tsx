/**
 * LeafEditForm - A client-side form component for editing leaf properties
 * Provides functionality to modify:
 * - Leaf name
 * - Associated twig
 * - Position within twig
 * - Timer duration for leaf tracking
 */
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
import { useTranslations } from "next-intl";
import { Id } from "../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

/**
 * LeafEditForm - A client-side form component for editing leaf properties
 * Provides functionality to modify:
 * - Leaf name
 * - Associated twig
 * - Position within twig
 * - Timer duration for leaf tracking
 */

/**
 * LeafEditForm - A client-side form component for editing leaf properties
 * Provides functionality to modify:
 * - Leaf name
 * - Associated twig
 * - Position within twig
 * - Timer duration for leaf tracking
 */

// Predefined timer duration options in minutes
// Each option has a translation key and its corresponding value in minutes
const TIMER_VALUES = [
  { key: "1min", value: 1 },
  { key: "2min", value: 2 },
  { key: "5min", value: 5 },
  { key: "10min", value: 10 },
  { key: "15min", value: 15 },
  { key: "20min", value: 20 },
  { key: "30min", value: 30 },
  { key: "45min", value: 45 },
  { key: "1hour", value: 60 },
  { key: "1_5hour", value: 90 },
  { key: "2hour", value: 120 },
];

/**
 * Props interface for LeafEditForm
 * @property name - Current leaf name
 * @property onNameChange - Callback for leaf name updates
 * @property timerDuration - Optional timer duration in minutes
 * @property onTimerDurationChange - Callback for timer duration updates
 * @property selectedTwigId - ID of currently selected twig
 * @property onTwigChange - Callback for twig selection changes
 * @property position - Leaf's position in the twig
 * @property onPositionChange - Callback for position updates
 * @property twigs - Available twigs list
 * @property leaves - Leaves in current twig
 * @property onSave - Save changes callback
 * @property onDelete - Delete leaf callback
 */
interface LeafEditFormProps {
  name: string;
  onNameChange: (name: string) => void;
  timerDuration: number | undefined;
  onTimerDurationChange: (duration: number | undefined) => void;
  selectedTwigId: Id<"twigs">;
  onTwigChange: (twigId: Id<"twigs">) => void;
  position: number;
  onPositionChange: (position: number) => void;
  xp: number;
  onXpChange: (xp: number) => void;
  twigs:
    | Array<{
        _id: Id<"twigs">;
        name: string;
      }>
    | undefined;
  leaves:
    | Array<{
        _id: Id<"leaves">;
        name: string;
      }>
    | undefined;
  onSave: () => void;
  onDelete: () => void;
}

export function LeafEditForm({
  name,
  onNameChange,
  timerDuration,
  onTimerDurationChange,
  selectedTwigId,
  onTwigChange,
  position,
  onPositionChange,
  xp,
  onXpChange,
  twigs,
  leaves,
  onSave,
  onDelete,
}: LeafEditFormProps) {
  const t = useTranslations("dialogs");

  return (
    <Card className="mx-auto my-8 max-w-xl border p-2 shadow-md">
      <div className="p-4">
        <h2 className="mb-6 text-lg font-semibold">{t("leaf.edit.title")}</h2>
        <div className="space-y-4">
          {/* Name input field for leaf */}
          <div>
            <Label htmlFor="edit-leaf-name">{t("leaf.edit.name.label")}</Label>
            <Input
              id="edit-leaf-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          {/* Twig selection with automatic position adjustment */}
          <div>
            <Label>{t("leaf.edit.twig.label")}</Label>
            <Select
              value={selectedTwigId}
              onValueChange={(value) => {
                onTwigChange(value as Id<"twigs">);
                // When twig changes, move leaf to end of new twig
                const twigLeaves = leaves?.length ?? 0;
                onPositionChange(twigLeaves + 1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("leaf.edit.twig.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {twigs?.map((cal) => (
                  <SelectItem key={cal._id} value={cal._id}>
                    {cal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position selector - dynamically updates based on leaves count */}
          <div>
            <Label>{t("leaf.edit.position.label")}</Label>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("leaf.edit.position.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: (leaves?.length ?? 0) + 1 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer duration selector with predefined options */}
          <div>
            <Label>{t("leaf.edit.timer.label")}</Label>
            <Select
              value={timerDuration?.toString() ?? "none"}
              onValueChange={(value) =>
                onTimerDurationChange(
                  value === "none" ? undefined : parseInt(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("leaf.edit.timer.placeholder")} />
              </SelectTrigger>
              <SelectContent className="max-h-40">
                <SelectItem value="none">
                  {t("leaf.edit.timer.noTimer")}
                </SelectItem>
                {TIMER_VALUES.map((duration) => (
                  <SelectItem
                    key={duration.value}
                    value={duration.value.toString()}
                  >
                    {t(`timers.${duration.key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* XP per completion */}
          <div>
            <Label htmlFor="edit-leaf-xp">{t("leaf.edit.xp.label")}</Label>
            <Input
              id="edit-leaf-xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Action buttons for saving or deleting the leaf */}
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" onClick={onDelete}>
              {t("leaf.edit.actions.delete")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("leaf.edit.actions.save")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
