"use client";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MotionWrapper } from "@/components/motion-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";

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

export function RootWrapper({ children }: RootWrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppHeader />
        <AppSidebar />
        <SidebarInset className="pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <MotionWrapper>{children}</MotionWrapper>
          </AnimatePresence>
        </SidebarInset>
        <BottomNav />
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
