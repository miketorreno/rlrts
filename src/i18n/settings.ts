export const locales = ["de", "en", "es", "fr", "ru", "he", "ar", "hi", "zh"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];
