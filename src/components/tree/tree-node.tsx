"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { useTreeContext } from "@/components/tree/tree-context";
import type { TreeNode } from "../../../convex/tree";

const typeIcons = {
  trunk: TreePine,
  limb: GitBranch,
  branch: Network,
  twig: CalendarDays,
  leaf: Leaf,
} as const;

const typeLabels: Record<TreeNode["type"], string> = {
  trunk: "Trunk",
  limb: "Limb",
  branch: "Branch",
  twig: "Twig",
  leaf: "Leaf",
};

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
  depth: number;
  posInSet: number;
  setSize: number;
  parentId: string | null;
}

export function TreeNode({
  node,
  defaultExpanded = false,
  depth,
  posInSet,
  setSize,
  parentId,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children.length > 0;
  const Icon = typeIcons[node.type];
  const rowRef = useRef<HTMLDivElement>(null);
  const { activeNodeId, setActiveNodeId, registerNode, unregisterNode } = useTreeContext();
  const isActive = activeNodeId === node.id;
  const defaultActiveRef = useRef(false);

  useEffect(() => {
    registerNode(node.id, { depth, parentId, posInSet, setSize });
    return () => unregisterNode(node.id);
  }, [node.id, depth, parentId, posInSet, setSize, registerNode, unregisterNode]);

  // Set first registered node as active on mount
  useEffect(() => {
    if (!defaultActiveRef.current) {
      defaultActiveRef.current = true;
      setActiveNodeId(node.id);
    }
  }, [node.id, setActiveNodeId]);

  const toggle = useCallback(() => setExpanded((prev) => !prev), []);

  useEffect(() => {
    if (isActive && rowRef.current) {
      rowRef.current.focus();
    }
  }, [isActive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const allTreeItems = Array.from(
        document.querySelectorAll<HTMLElement>('[role="treeitem"]'),
      );

      const currentIdx = allTreeItems.indexOf(rowRef.current!);
      if (currentIdx === -1) return;

      function focusAndActivate(el: HTMLElement) {
        const id = el.dataset.nodeId;
        if (id) setActiveNodeId(id);
        el.focus();
      }

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const next = allTreeItems[currentIdx + 1];
          if (next) focusAndActivate(next);
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prev = allTreeItems[currentIdx - 1];
          if (prev) focusAndActivate(prev);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          if (hasChildren && !expanded) {
            setExpanded(true);
          } else if (hasChildren && expanded) {
            const next = allTreeItems[currentIdx + 1];
            if (next) focusAndActivate(next);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          if (hasChildren && expanded) {
            setExpanded(false);
          } else if (parentId) {
            const parentEl = allTreeItems.find(
              (el) => el.dataset.nodeId === parentId,
            );
            if (parentEl) focusAndActivate(parentEl);
          }
          break;
        }
        case "Home": {
          e.preventDefault();
          const first = allTreeItems[0];
          if (first) focusAndActivate(first);
          break;
        }
        case "End": {
          e.preventDefault();
          const last = allTreeItems[allTreeItems.length - 1];
          if (last) focusAndActivate(last);
          break;
        }
        case "Enter": {
          e.preventDefault();
          const link = rowRef.current?.querySelector<HTMLAnchorElement>("a[href]");
          if (link) link.click();
          break;
        }
        case " ": {
          e.preventDefault();
          if (hasChildren) {
            setExpanded((prev) => !prev);
          }
          break;
        }
      }
    },
    [hasChildren, expanded, parentId, setActiveNodeId],
  );

  return (
    <div
      role="treeitem"
      aria-level={depth + 1}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={false}
      aria-label={`${typeLabels[node.type]}: ${node.name}`}
      data-node-id={node.id}
    >
      <div
        ref={rowRef}
        tabIndex={isActive ? 0 : -1}
        onKeyDown={handleKeyDown}
        className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      >
        <button
          type="button"
          onClick={toggle}
          aria-expanded={hasChildren ? expanded : undefined}
          tabIndex={-1}
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
          tabIndex={-1}
          className="shrink-0 rounded-md px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground opacity-0 pointer-events-none group-hover:inline-block group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus:opacity-100 focus:pointer-events-auto focus:outline-none focus:ring-2 focus:ring-ring"
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
            role="group"
          >
            {node.children.map((child, i) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                posInSet={i + 1}
                setSize={node.children.length}
                parentId={node.id}
              />
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
