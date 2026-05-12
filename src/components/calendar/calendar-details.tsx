"use client";

import { CalendarBackNavigation } from "@/components/calendar/details/calendar-back-navigation";
import { CalendarDeleteDialog } from "@/components/calendar/details/calendar-delete-dialog";
import { CalendarEditForm } from "@/components/calendar/details/calendar-edit-form";
import { CalendarHabitsList } from "@/components/calendar/details/calendar-habits-list";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

interface CalendarDetailsProps {
  calendarId: Id<"calendars">;
}

export function CalendarDetails({ calendarId }: CalendarDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Fetch calendar and associated data
  const calendars = useQuery(api.calendars.list);
  const calendar = calendars?.find((c) => c._id === calendarId);
  const habits = useQuery(api.habits.list, { calendarId });

  // State for form fields
  const [name, setName] = useState(calendar?.name ?? "");
  const [colorTheme, setColorTheme] = useState(
    calendar?.colorTheme ?? "bg-red-500",
  );
  const [position, setPosition] = useState<number>(calendar?.position ?? 1);

  // Update form fields when calendar data changes
  useEffect(() => {
    if (calendar) {
      setName(calendar.name);
      setColorTheme(calendar.colorTheme);
      setPosition(calendar.position ?? 1);
    }
  }, [calendar]);

  // Sort calendars by position to ensure correct order
  const sortedCalendars =
    calendars?.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) ??
    [];

  // Mutations
  const updateCalendar = useMutation(api.calendars.update);
  const deleteCalendar = useMutation(api.calendars.remove);

  if (!calendar) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      await updateCalendar({
        id: calendarId,
        name,
        colorTheme,
        position,
      });
      toast({ description: "Calendar updated successfully" });
      router.push("/calendar");
    } catch (error) {
      toast({
        description: `Failed to update calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setShowDeleteAlert(false);
      router.replace("/calendar");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await deleteCalendar({ id: calendarId });
      toast({ description: "Calendar deleted", variant: "destructive" });
    } catch (error) {
      toast({
        description: `Failed to delete calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <CalendarBackNavigation />

      <div className="text-center">
        <h1 className="mb-8 text-2xl font-bold">{name}</h1>
      </div>

      <CalendarHabitsList habits={habits} />

      <CalendarEditForm
        name={name}
        onNameChange={setName}
        colorTheme={colorTheme}
        onColorThemeChange={setColorTheme}
        position={position}
        onPositionChange={setPosition}
        totalCalendars={sortedCalendars.length}
        onSave={handleSave}
        onDelete={() => setShowDeleteAlert(true)}
      />

      <CalendarDeleteDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}
        onConfirm={handleDelete}
        calendarName={name}
      />
    </div>
  );
}
