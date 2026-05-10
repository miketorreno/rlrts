import { Locale, defaultLocale } from "@/i18n/settings";
import "./globals.css";

/**
 * This is the top-level layout that wraps all pages and provides common functionality.
 */

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  const { locale: paramLocale } = await params;
  const locale = (paramLocale || defaultLocale) as Locale;

  return (
    <html lang={locale} suppressHydrationWarning>
      {children}
    </html>
  );
}
