"use client";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronRight,
  GitBranch,
  Leaf,
  Network,
  TreePine,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { TreeNode } from "../../../convex/tree";

const typeIcons = {
  trunk: TreePine,
  limb: GitBranch,
  branch: Network,
  twig: CalendarDays,
  leaf: Leaf,
} as const;

const typeLinks: Record<TreeNode["type"], string> = {
  trunk: "/trunks",
  limb: "/limbs",
  branch: "/branches",
  twig: "/twig",
  leaf: "/leaves",
};

function colorClass(colorTheme: string | undefined): string {
  if (!colorTheme) return "bg-muted";
  const map: Record<string, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    amber: "bg-amber-500",
    yellow: "bg-yellow-500",
    lime: "bg-lime-500",
    green: "bg-green-500",
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500",
    sky: "bg-sky-500",
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    fuchsia: "bg-fuchsia-500",
    pink: "bg-pink-500",
    rose: "bg-rose-500",
  };
  return map[colorTheme] ?? "bg-muted";
}

interface TreeNodeProps {
  node: TreeNode;
  defaultExpanded?: boolean;
}

export function TreeNode({ node, defaultExpanded = false }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const Icon = typeIcons[node.type];

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  return (
    <div>
      <div className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={hasChildren ? expanded : undefined}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-sm p-0.5 transition-colors hover:bg-muted",
            !hasChildren && "invisible",
          )}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-90",
            )}
          />
        </button>

        {node.type === "twig" && node.colorTheme ? (
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", colorClass(node.colorTheme))} />
        ) : null}

        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />

        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {node.name}
        </span>

        {hasChildren ? (
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            {node.children.length}
          </span>
        ) : null}

        <Link
          href={`${typeLinks[node.type]}/${node.id}`}
          className="hidden shrink-0 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:inline-block"
        >
          View
        </Link>
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasChildren ? (
          <motion.div
            key="children"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden ps-6"
          >
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
