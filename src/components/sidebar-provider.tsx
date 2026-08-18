"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SidebarContextValue = {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function getInitialOpen(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem("sidebar-open");
  return stored !== null ? stored === "true" : true;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(getInitialOpen);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-open", String(next));
      return next;
    });
  }, []);

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open);
    localStorage.setItem("sidebar-open", String(open));
  }, []);

  const value = useMemo(
    () => ({ isOpen, toggle, setOpen }),
    [isOpen, toggle, setOpen],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
