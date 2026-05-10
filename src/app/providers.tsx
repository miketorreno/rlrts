"use client";

import { IntlProvider } from "@/components/intl-provider";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "next-themes";
import { PropsWithChildren } from "react";

/**
 * Root providers component that wraps the application with necessary context providers:
 * - Internationalization (next-intl)
 * - Authentication (Clerk)
 * - State Management (Convex)
 * - Theme Management (next-themes)
 */

// Initialize Convex client for real-time state management
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

interface ProvidersProps extends PropsWithChildren {
  locale: string; // Current language/locale code
  messages: AbstractIntlMessages; // Translation messages for the current locale
}

/**
 * Providers component that establishes the context hierarchy:
 * 1. IntlProvider - Handles translations and localization
 * 2. ClerkProvider - Manages authentication state and user sessions
 * 3. ConvexProviderWithClerk - Integrates Convex state with Clerk auth
 * 4. ThemeProvider - Manages light/dark theme preferences
 */
export function Providers({ children, locale, messages }: ProvidersProps) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
        afterSignUpUrl="/calendar"
        afterSignInUrl="/calendar"
        afterSignOutUrl="/"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </IntlProvider>
  );
}
