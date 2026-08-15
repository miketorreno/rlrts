"use client";

// import { ThirdPartyScripts } from "@/components/analytics/third-party-scripts";
import { cn } from "@/lib/utils";
// import { Analytics } from "@vercel/analytics/react";
// import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Inter,
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Hebrew,
  Noto_Sans_SC,
} from "next/font/google";
import Link from "next/link";
import { AppFooter } from "@/components/app-footer";
import { AppHeader } from "@/components/app-header";
import { MotionWrapper } from "@/components/motion-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "next-themes";

// Load and configure Inter font with Latin subset for optimal performance
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const noto = Noto_Sans({
  variable: "--font-noto",
  subsets: ["latin", "latin-ext", "cyrillic", "devanagari"],
  display: "swap",
  preload: true,
});

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-hebrew",
  subsets: ["hebrew"],
  display: "swap",
  preload: true,
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  display: "swap",
  preload: true,
});

const notoChinese = Noto_Sans_SC({
  variable: "--font-noto-chinese",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function NotFound() {
  return (
    <body
      className={cn(
        inter.variable,
        noto.variable,
        notoHebrew.variable,
        notoArabic.variable,
        notoChinese.variable,
        "min-h-screen bg-background font-sans antialiased",
        "grid-background",
      )}
    >
      {/* Background gradient overlay */}
      {/* <div className="fixed inset-0 bg-linear-to-t from-muted/60 to-transparent"></div> */}

      <main className="relative overflow-x-hidden bgs-amber-50">
        <div className="flex items-center justify-center h-screen min-h-screen w-full flex-colss align-middless">
          {/* Main content with page transition animations */}
          <AnimatePresence mode="wait">
            <MotionWrapper>
              <div className="bgs-white">
                <h2>Not Found</h2>
                <p>Could not find requested resource</p>
                <Link href="/">Return Home</Link>
              </div>
            </MotionWrapper>
          </AnimatePresence>
        </div>
      </main>
    </body>
  );
}
