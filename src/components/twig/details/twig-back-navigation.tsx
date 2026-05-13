"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function TwigBackNavigation() {
  const t = useTranslations("dialogs");
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 p-2">
      <Button
        variant="ghost"
        onClick={() => router.push("/twig")}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("twig.edit.actions.back")}
      </Button>
    </div>
  );
}
