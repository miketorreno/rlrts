import { Providers } from "@/app/providers";
// import { ThirdPartyScripts } from "@/components/analytics/third-party-scripts";
import { RootWrapper } from "@/components/root-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { metadata as i18nMetadata } from "@/i18n/metadata";
import { Locale, defaultLocale, locales } from "@/i18n/settings";
import { cn } from "@/lib/utils";
// import { Analytics } from "@vercel/analytics/react";
// import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  Inter,
  Noto_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Hebrew,
  Noto_Sans_SC,
} from "next/font/google";
import { notFound } from "next/navigation";

/**
 * Root layout component for locale-specific routes
 * Handles internationalization setup, font loading, and base layout structure
 */

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

/**
 * Generate static paths for non-default locales at build time
 * Improves performance by pre-rendering locale-specific pages
 */
export function generateStaticParams() {
  return locales
    .filter((locale) => locale !== defaultLocale)
    .map((locale) => ({ locale }));
}

/**
 * Layout component that wraps all pages within a locale segment
 * Handles:
 * - Locale validation and setup
 * - Message loading for translations
 * - Base styling and RTL support
 * - NoScript fallback
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate requested locale against supported ones
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Configure locale for the current request and load translations
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

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
        // Enable RTL layout for Hebrew and Arabic locales
        (locale === "he" || locale === "ar") && "rtl",
      )}
    >
      {/* <ThirdPartyScripts /> */}
      {/* NoScript fallback for users with JavaScript disabled */}
      {/* <noscript>
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background">
          <p className="rounded border bg-card px-6 py-4 text-center shadow-lg">
            Please enable JavaScript to use this app.
          </p>
        </div>
      </noscript> */}

      {/* Background gradient overlay */}
      <div className="fixed inset-0 bg-linear-to-t from-muted/60 to-transparent" />

      <Providers locale={locale} messages={messages}>
        <div className="relative overflow-x-hidden">
          <RootWrapper>{children}</RootWrapper>
        </div>
        <Toaster />
        {/* <SpeedInsights /> */}
        {/* <Analytics /> */}
      </Providers>
    </body>
  );
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: keyof typeof i18nMetadata }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = i18nMetadata[locale] ?? i18nMetadata.en;

  return {
    metadataBase: new URL("https://www.official.domain.com"),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      images: ["/og-image.png"],
      type: "website",
      siteName: meta.title.split(" - ")[0],
      url: `https://www.official.domain.com/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og-image.png"],
    },
    manifest: "/manifest.json",
  };
}
