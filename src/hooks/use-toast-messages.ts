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
    leaf: {
      created: () => toast.success(t("leaf.created")),
      updated: () => toast.success(t("leaf.updated")),
      deleted: () => toast.success(t("leaf.deleted")),
    },
  };
}
