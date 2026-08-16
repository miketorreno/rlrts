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
    trunk: {
      created: () => toast.success(t("trunk.created")),
      updated: () => toast.success(t("trunk.updated")),
      deleted: () => toast.success(t("trunk.deleted")),
    },
    limb: {
      created: () => toast.success(t("limb.created")),
      updated: () => toast.success(t("limb.updated")),
      deleted: () => toast.success(t("limb.deleted")),
    },
  };
}
