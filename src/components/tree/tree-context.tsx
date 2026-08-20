"use client";

import { createContext, useContext } from "react";

export interface TreeNodeInfo {
  depth: number;
  parentId: string | null;
  posInSet: number;
  setSize: number;
}

export interface TreeContextValue {
  activeNodeId: string | null;
  setActiveNodeId: (id: string) => void;
  registerNode: (id: string, info: TreeNodeInfo) => void;
  unregisterNode: (id: string) => void;
}

export const TreeContext = createContext<TreeContextValue | null>(null);

export function useTreeContext() {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error("useTreeContext must be used within TreeContext.Provider");
  return ctx;
}
