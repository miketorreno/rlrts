"use client";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MotionWrapper } from "@/components/motion-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

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
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <AppSidebar />

        {/* Main content with page transition animations */}
        <main className="flex-1 pb-20 md:ps-64 md:pb-0">
          <AnimatePresence mode="wait">
            <MotionWrapper>{children}</MotionWrapper>
          </AnimatePresence>
        </main>

        <BottomNav />

        <Toaster />
      </div>
    </ThemeProvider>
  );
}
