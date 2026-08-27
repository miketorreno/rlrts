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
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <div className="flex-1 overflow-hidden pb-20 md:pb-0">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                <MotionWrapper>{children}</MotionWrapper>
              </AnimatePresence>
            </div>
          </div>
          <BottomNav />
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
