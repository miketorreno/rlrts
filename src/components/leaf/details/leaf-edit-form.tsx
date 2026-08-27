"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import { Id } from "../../../../convex/_generated/dataModel";

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

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

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
  reminderTime: { hour: number; minute: number } | undefined;
  onReminderTimeChange: (
    time: { hour: number; minute: number } | undefined,
  ) => void;
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
  reminderTime,
  onReminderTimeChange,
}: LeafEditFormProps) {
  const t = useTranslations("dialogs");
  const hasReminder = !!reminderTime;

  return (
    <Card className="mx-auto my-8 max-w-xl">
      <CardHeader>
        <CardTitle>{t("leaf.edit.title")}</CardTitle>
        <CardDescription>
          Configure your habit&apos;s schedule, timer, and reminders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="edit-leaf-name">
              {t("leaf.edit.name.label")}
            </FieldLabel>
            <Input
              id="edit-leaf-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>{t("leaf.edit.twig.label")}</FieldLabel>
            <Select
              value={selectedTwigId}
              onValueChange={(value) => {
                onTwigChange(value as Id<"twigs">);
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
          </Field>

          <Field>
            <FieldLabel>{t("leaf.edit.position.label")}</FieldLabel>
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
          </Field>

          <FieldSeparator>Schedule</FieldSeparator>

          <Field>
            <FieldLabel>{t("leaf.edit.timer.label")}</FieldLabel>
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
            <FieldDescription>
              Optional timer to track focused sessions.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="edit-leaf-xp">
              {t("leaf.edit.xp.label")}
            </FieldLabel>
            <Input
              id="edit-leaf-xp"
              type="number"
              min={0}
              value={xp}
              onChange={(e) => onXpChange(parseInt(e.target.value) || 0)}
            />
          </Field>

          <FieldSeparator>Reminders</FieldSeparator>

          <Field orientation="horizontal">
            <FieldLabel htmlFor="reminder-toggle">
              <div className="flex flex-col gap-0.5">
                <span>{t("leaf.edit.reminder.label")}</span>
                <span className="font-normal text-muted-foreground text-xs">
                  {hasReminder
                    ? `${t("leaf.edit.reminder.enabled")}`
                    : t("leaf.edit.reminder.disabled")}
                </span>
              </div>
            </FieldLabel>
            <div className="ml-auto">
              <Switch
                id="reminder-toggle"
                checked={hasReminder}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onReminderTimeChange({
                      hour: reminderTime?.hour ?? 9,
                      minute: reminderTime?.minute ?? 0,
                    });
                  } else {
                    onReminderTimeChange(undefined);
                  }
                }}
              />
            </div>
          </Field>

          {hasReminder && (
            <Field>
              <FieldLabel>{t("leaf.edit.reminder.at")}</FieldLabel>
              <div className="flex items-center gap-2">
                <Select
                  value={reminderTime.hour.toString()}
                  onValueChange={(value) =>
                    onReminderTimeChange({
                      ...reminderTime,
                      hour: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">:</span>
                <Select
                  value={reminderTime.minute.toString()}
                  onValueChange={(value) =>
                    onReminderTimeChange({
                      ...reminderTime,
                      minute: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MINUTES.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Field>
          )}

          <FieldSeparator />

          <div className="flex gap-2 pt-2">
            <Button variant="destructive" onClick={onDelete}>
              {t("leaf.edit.actions.delete")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("leaf.edit.actions.save")}
            </Button>
          </div>
        </FieldGroup>
      </CardContent>
    </Card>
  );
}
