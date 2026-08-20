"use client";

import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const errorStrings: Record<string, { title: string; description: string; retry: string }> = {
  en: { title: "Something went wrong", description: "An unexpected error occurred. Please try again.", retry: "Try Again" },
  de: { title: "Etwas ist schiefgelaufen", description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.", retry: "Erneut versuchen" },
  es: { title: "Algo salió mal", description: "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.", retry: "Intentar de nuevo" },
  fr: { title: "Une erreur s'est produite", description: "Une erreur inattendue s'est produite. Veuillez réessayer.", retry: "Réessayer" },
  ru: { title: "Что-то пошло не так", description: "Произошла непредвиденная ошибка. Пожалуйста, попробуйте снова.", retry: "Попробовать снова" },
  he: { title: "משהו השתבש", description: "אירעה שגיאה לא צפויה. אנא נסה שוב.", retry: "נסה שוב" },
  ar: { title: "حدث خطأ ما", description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", retry: "حاول مرة أخرى" },
  hi: { title: "कुछ गलत हो गया", description: "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।", retry: "पुनः प्रयास करें" },
  zh: { title: "出了点问题", description: "发生了意外错误。请重试。", retry: "重试" },
};

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/");
  const locale = segments[1];
  return errorStrings[locale] ? locale : "en";
}

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const strings = errorStrings[locale] ?? errorStrings.en;

  return (
    <div className="container mx-auto max-w-7xl px-4 pt-16">
      <ErrorBoundary
        title={strings.title}
        description={strings.description}
        retryLabel={strings.retry}
        onRetry={reset}
      >
        <div />
      </ErrorBoundary>
    </div>
  );
}
