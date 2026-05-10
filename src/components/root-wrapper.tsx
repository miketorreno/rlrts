"use client";

import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { MotionWrapper } from "@/components/motion-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

/**
 * Root application wrapper component that provides core functionality:
 * - Theme management with system preference support
 * - Page transition animations
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

        {/* Main content with page transition animations */}
        <AnimatePresence mode="wait">
          <MotionWrapper>{children}</MotionWrapper>
        </AnimatePresence>

        <AppFooter />

        <Toaster />
      </div>
    </ThemeProvider>
  );
}
