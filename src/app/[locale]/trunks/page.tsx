"use client";

import { TrunkList } from "@/components/trunk/trunk-list";
import { TreeView } from "@/components/tree/tree-view";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "@/i18n/routing";
import { useConvexAuth, useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";

type TrunkView = "list" | "tree";

export default function TrunksPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const t = useTranslations("trunks");
  const trunks = useQuery(api.trunks.list, isAuthenticated ? {} : "skip");
  const [view, setView] = useState<TrunkView>("tree");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <Tabs value={view} onValueChange={(v) => setView(v as TrunkView)}>
        <TabsList>
          <TabsTrigger asChild value="tree">
            <button>{t("treeView")}</button>
          </TabsTrigger>
          <TabsTrigger asChild value="list">
            <button>{t("listView")}</button>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        {view === "tree" ? <TreeView /> : <TrunkList trunks={trunks} />}
      </div>
    </div>
  );
}
