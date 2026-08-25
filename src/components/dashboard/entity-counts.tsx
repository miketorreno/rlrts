"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NumberFlow from "@number-flow/react";
import { Layers, GitBranch, Sprout, CalendarDays, Leaf, ListTodo } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const entityLinks: Record<string, string> = {
  trunks: "/trunks",
  limbs: "/limbs",
  branches: "/branches",
  twigs: "/twig",
  todos: "/todos",
};

interface EntityChipProps {
  icon: LucideIcon;
  count: number;
  label: string;
}

function EntityChip({ icon: Icon, count, label }: EntityChipProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-300 snap-start shrink-0">
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <Badge variant="secondary" className="tabular-nums">
          <NumberFlow value={count} className="font-bold" />
        </Badge>
        <span className="text-sm text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

interface EntityCountsProps {
  counts: {
    trunks: number;
    limbs: number;
    branches: number;
    twigs: number;
    leaves: number;
    todos: number;
  };
}

export function EntityCounts({ counts }: EntityCountsProps) {
  const t = useTranslations("dashboard");

  const entities = useMemo(
    () => [
      { key: "trunks", label: t("trunks"), icon: Layers, count: counts.trunks },
      { key: "limbs", label: t("limbs"), icon: GitBranch, count: counts.limbs },
      { key: "branches", label: t("branches"), icon: Sprout, count: counts.branches },
      { key: "twigs", label: t("twigs"), icon: CalendarDays, count: counts.twigs },
      { key: "leaves", label: t("leaves"), icon: Leaf, count: counts.leaves },
      { key: "todos", label: t("todos"), icon: ListTodo, count: counts.todos },
    ],
    [t, counts],
  );

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
      {entities.map((entity) => {
        const href = entityLinks[entity.key];
        const chip = <EntityChip icon={entity.icon} count={entity.count} label={entity.label} />;

        if (href) {
          return (
            <Link key={entity.key} href={href}>
              {chip}
            </Link>
          );
        }

        return <div key={entity.key}>{chip}</div>;
      })}
    </div>
  );
}
