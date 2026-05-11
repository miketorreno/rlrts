import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

export function useToastMessages() {
  const t = useTranslations("toast");

  return {
    calendar: {
      created: () => toast.success(t("calendar.created")),
      updated: () => toast.success(t("calendar.updated")),
      deleted: () => toast.success(t("calendar.deleted")),
    },
    habit: {
      created: () => toast.success(t("habit.created")),
      updated: () => toast.success(t("habit.updated")),
      deleted: () => toast.success(t("habit.deleted")),
    },
  };
}
