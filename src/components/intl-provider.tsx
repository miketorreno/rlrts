"use client";

import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { PropsWithChildren } from "react";

interface IntlProviderProps extends PropsWithChildren {
  locale: string; /** Locale code for the current language (e.g., 'en', 'fr', 'ar') */
  messages: AbstractIntlMessages; /** Translation messages object containing key-value pairs for the current locale */
  timeZone?: string; /** Optional timezone for date/time formatting, defaults to UTC */
}

export function IntlProvider({
  children,
  locale,
  messages,
  timeZone = "UTC",
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      onError={(error) => {
        // Log translation errors to console for debugging
        console.error(error);
      }}
    >
      {children}
    </NextIntlClientProvider>
  );
}
