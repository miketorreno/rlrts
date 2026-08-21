"use client";

import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

const UNDO_TIMEOUT_MS = 5000;

interface PendingDelete {
  timeoutId: ReturnType<typeof setTimeout>;
}

export function useUndoDelete() {
  const { toast, dismiss } = useToast();
  const t = useTranslations("common");
  const pendingRef = useRef<PendingDelete | null>(null);

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current.timeoutId);
      }
    };
  }, []);

  const undoableDelete = useCallback(
    async <T,>(
      deleteFn: () => Promise<void>,
      item: T,
      itemName: string,
      recreate: (item: T) => Promise<void>,
    ) => {
      const result = toast({
        title: t("deleted", { name: itemName }),
        action: (
          <ToastAction
            altText={t("undo")}
            onClick={async () => {
              if (pendingRef.current) {
                clearTimeout(pendingRef.current.timeoutId);
                pendingRef.current = null;
              }
              dismiss(result.id);
              try {
                await recreate(item);
              } catch (error) {
                console.error("Failed to undo delete:", error);
              }
            }}
          >
            {t("undo")}
          </ToastAction>
        ),
      });

      const timeoutId = setTimeout(() => {
        pendingRef.current = null;
        deleteFn().catch((error) => {
          console.error("Failed to delete:", error);
        });
      }, UNDO_TIMEOUT_MS);

      pendingRef.current = { timeoutId };
    },
    [toast, dismiss, t],
  );

  return { undoableDelete };
}
