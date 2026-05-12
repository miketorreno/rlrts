/**
 * HabitEditForm - A client-side form component for editing habit properties
 * Provides functionality to modify:
 * - Habit name
 * - Associated calendar
 * - Position within calendar
 * - Timer duration for habit tracking
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
 * HabitEditForm - A client-side form component for editing habit properties
 * Provides functionality to modify:
 * - Habit name
 * - Associated calendar
 * - Position within calendar
 * - Timer duration for habit tracking
 */

/**
 * HabitEditForm - A client-side form component for editing habit properties
 * Provides functionality to modify:
 * - Habit name
 * - Associated calendar
 * - Position within calendar
 * - Timer duration for habit tracking
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
 * Props interface for HabitEditForm
 * @property name - Current habit name
 * @property onNameChange - Callback for habit name updates
 * @property timerDuration - Optional timer duration in minutes
 * @property onTimerDurationChange - Callback for timer duration updates
 * @property selectedCalendarId - ID of currently selected calendar
 * @property onCalendarChange - Callback for calendar selection changes
 * @property position - Habit's position in the calendar
 * @property onPositionChange - Callback for position updates
 * @property calendars - Available calendars list
 * @property habits - Habits in current calendar
 * @property onSave - Save changes callback
 * @property onDelete - Delete habit callback
 */
interface HabitEditFormProps {
  name: string;
  onNameChange: (name: string) => void;
  timerDuration: number | undefined;
  onTimerDurationChange: (duration: number | undefined) => void;
  selectedCalendarId: Id<"calendars">;
  onCalendarChange: (calendarId: Id<"calendars">) => void;
  position: number;
  onPositionChange: (position: number) => void;
  calendars:
    | Array<{
        _id: Id<"calendars">;
        name: string;
      }>
    | undefined;
  habits:
    | Array<{
        _id: Id<"habits">;
        name: string;
      }>
    | undefined;
  onSave: () => void;
  onDelete: () => void;
}

export function HabitEditForm({
  name,
  onNameChange,
  timerDuration,
  onTimerDurationChange,
  selectedCalendarId,
  onCalendarChange,
  position,
  onPositionChange,
  calendars,
  habits,
  onSave,
  onDelete,
}: HabitEditFormProps) {
  const t = useTranslations("dialogs");

  return (
    <Card className="mx-auto my-8 max-w-xl border p-2 shadow-md">
      <div className="p-4">
        <h2 className="mb-6 text-lg font-semibold">{t("habit.edit.title")}</h2>
        <div className="space-y-4">
          {/* Name input field for habit */}
          <div>
            <Label htmlFor="edit-habit-name">
              {t("habit.edit.name.label")}
            </Label>
            <Input
              id="edit-habit-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          {/* Calendar selection with automatic position adjustment */}
          <div>
            <Label>{t("habit.edit.calendar.label")}</Label>
            <Select
              value={selectedCalendarId}
              onValueChange={(value) => {
                onCalendarChange(value as Id<"calendars">);
                // When calendar changes, move habit to end of new calendar
                const calendarHabits = habits?.length ?? 0;
                onPositionChange(calendarHabits + 1);
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("habit.edit.calendar.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {calendars?.map((cal) => (
                  <SelectItem key={cal._id} value={cal._id}>
                    {cal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position selector - dynamically updates based on habits count */}
          <div>
            <Label>{t("habit.edit.position.label")}</Label>
            <Select
              value={position.toString()}
              onValueChange={(value) => onPositionChange(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("habit.edit.position.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: (habits?.length ?? 0) + 1 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timer duration selector with predefined options */}
          <div>
            <Label>{t("habit.edit.timer.label")}</Label>
            <Select
              value={timerDuration?.toString() ?? "none"}
              onValueChange={(value) =>
                onTimerDurationChange(
                  value === "none" ? undefined : parseInt(value),
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("habit.edit.timer.placeholder")} />
              </SelectTrigger>
              <SelectContent className="max-h-40">
                <SelectItem value="none">
                  {t("habit.edit.timer.noTimer")}
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

          {/* Action buttons for saving or deleting the habit */}
          <div className="flex gap-2 pt-4">
            <Button variant="destructive" onClick={onDelete}>
              {t("habit.edit.actions.delete")}
            </Button>
            <Button onClick={onSave} className="flex-1">
              {t("habit.edit.actions.save")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
