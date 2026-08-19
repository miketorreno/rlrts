"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
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

export function EntityCounts() {
  const t = useTranslations("dashboard");
  const trunks = useQuery(api.trunks.list, {});
  const limbs = useQuery(api.limbs.list, {});
  const branches = useQuery(api.branches.list, {});
  const twigs = useQuery(api.twigs.list, {});
  const leaves = useQuery(api.leaves.list, {});
  const todos = useQuery(api.todos.list, {});

  const isLoading =
    trunks === undefined ||
    limbs === undefined ||
    branches === undefined ||
    twigs === undefined ||
    leaves === undefined ||
    todos === undefined;

  const entities = [
    { key: "trunks", label: t("trunks"), icon: Layers, count: trunks?.length ?? 0 },
    { key: "limbs", label: t("limbs"), icon: GitBranch, count: limbs?.length ?? 0 },
    { key: "branches", label: t("branches"), icon: Sprout, count: branches?.length ?? 0 },
    { key: "twigs", label: t("twigs"), icon: CalendarDays, count: twigs?.length ?? 0 },
    { key: "leaves", label: t("leaves"), icon: Leaf, count: leaves?.length ?? 0 },
    { key: "todos", label: t("todos"), icon: ListTodo, count: todos?.todos?.length ?? 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-12 w-28 shrink-0 animate-pulse items-center gap-2 rounded-xl border px-4 py-3"
          >
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-6 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

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
