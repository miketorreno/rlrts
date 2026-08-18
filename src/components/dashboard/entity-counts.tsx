"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, GitBranch, Sprout, CalendarDays, Leaf, ListTodo } from "lucide-react";

export function EntityCounts() {
  const t = useTranslations("dashboard");
  const trunks = useQuery(api.trunks.list, {});
  const limbs = useQuery(api.limbs.list, {});
  const branches = useQuery(api.branches.list, {});
  const twigs = useQuery(api.twigs.list, {});
  const leaves = useQuery(api.leaves.list, {});
  const todos = useQuery(api.todos.list, {});

  const entities = [
    { label: t("trunks"), icon: Layers, count: trunks?.length },
    { label: t("limbs"), icon: GitBranch, count: limbs?.length },
    { label: t("branches"), icon: Sprout, count: branches?.length },
    { label: t("twigs"), icon: CalendarDays, count: twigs?.length },
    { label: t("leaves"), icon: Leaf, count: leaves?.length },
    { label: t("todos"), icon: ListTodo, count: todos?.todos?.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {entities.map((entity) => (
        <Card key={entity.label}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <entity.icon className="h-4 w-4" />
              {entity.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entity.count ?? "—"}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
