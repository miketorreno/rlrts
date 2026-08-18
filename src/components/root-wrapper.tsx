"use client";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MotionWrapper } from "@/components/motion-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";
import { cn } from "@/lib/utils";

/**
 * Root application wrapper component that provides core functionality:
 * - Theme management with system preference support
 * - Page transition animations
 * - Responsive navigation (mobile top bar + bottom nav, desktop sidebar)
 * - Consistent layout structure
 * - Toast notifications
 */

interface RootWrapperProps {
  children: React.ReactNode;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <main
      className={cn(
        "flex-1 pb-20 transition-all duration-300 md:pb-0",
        isOpen ? "md:ps-64" : "md:ps-16",
      )}
    >
      <AnimatePresence mode="wait">
        <MotionWrapper>{children}</MotionWrapper>
      </AnimatePresence>
    </main>
  );
}

export function RootWrapper({ children }: RootWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col">
          <AppHeader />
          <AppSidebar />
          <MainContent>{children}</MainContent>
          <BottomNav />
          <Toaster />
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
