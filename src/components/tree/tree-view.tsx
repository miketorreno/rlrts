"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TreeNode } from "@/components/tree/tree-node";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";

export function TreeView() {
  const t = useTranslations("trunks");
  const data = useQuery(api.tree.getFullTree);

  if (data === undefined) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const { trunks, rootTwigs } = data;
  const isEmpty = trunks.length === 0 && rootTwigs.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("treeView")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12">
            <p className="text-sm text-muted-foreground">
              {t("emptyTree")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {trunks.map((trunk) => (
              <TreeNode key={trunk.id} node={trunk} defaultExpanded />
            ))}

            {rootTwigs.length > 0 ? (
              <>
                <div className="my-3 border-t" />
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                  {t("rootTwigs")}
                </p>
                {rootTwigs.map((twig) => (
                  <TreeNode key={twig.id} node={twig} />
                ))}
              </>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
