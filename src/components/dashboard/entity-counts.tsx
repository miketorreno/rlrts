"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import NumberFlow from "@number-flow/react";
import { Layers, GitBranch, Sprout, CalendarDays, Leaf, ListTodo } from "lucide-react";

const entityLinks: Record<string, string> = {
  trunks: "/trunks",
  limbs: "/limbs",
  branches: "/branches",
  twigs: "/twig",
  todos: "/todos",
};

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

  const entities = [
    { key: "trunks", label: t("trunks"), icon: Layers, count: counts.trunks },
    { key: "limbs", label: t("limbs"), icon: GitBranch, count: counts.limbs },
    { key: "branches", label: t("branches"), icon: Sprout, count: counts.branches },
    { key: "twigs", label: t("twigs"), icon: CalendarDays, count: counts.twigs },
    { key: "leaves", label: t("leaves"), icon: Leaf, count: counts.leaves },
    { key: "todos", label: t("todos"), icon: ListTodo, count: counts.todos },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
      {entities.map((entity) => {
        const href = entityLinks[entity.key];
        const chip = (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-xl border bg-card px-4 py-3 snap-start whitespace-nowrap hover:bg-muted transition-colors"
          >
            <entity.icon className="h-4 w-4 text-muted-foreground" />
            <NumberFlow value={entity.count} className="text-lg font-bold" />
            <span className="text-sm text-muted-foreground">{entity.label}</span>
          </motion.div>
        );

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
