import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";

export function useToastMessages() {
  const t = useTranslations("toast");

  return {
    twig: {
      created: () => toast.success(t("twig.created")),
      updated: () => toast.success(t("twig.updated")),
      deleted: () => toast.success(t("twig.deleted")),
    },
    leaf: {
      created: () => toast.success(t("leaf.created")),
      updated: () => toast.success(t("leaf.updated")),
      deleted: () => toast.success(t("leaf.deleted")),
    },
  };
}
