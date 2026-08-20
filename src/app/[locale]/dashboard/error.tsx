"use client";

import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const dashboardErrorStrings: Record<string, { title: string; description: string; retry: string }> = {
  en: { title: "Something went wrong", description: "Failed to load dashboard data. Please try again.", retry: "Try Again" },
  de: { title: "Etwas ist schiefgelaufen", description: "Dashboard-Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.", retry: "Erneut versuchen" },
  es: { title: "Algo salió mal", description: "No se pudieron cargar los datos del panel. Por favor, inténtalo de nuevo.", retry: "Intentar de nuevo" },
  fr: { title: "Une erreur s'est produite", description: "Échec du chargement des données du tableau de bord. Veuillez réessayer.", retry: "Réessayer" },
  ru: { title: "Что-то пошло не так", description: "Не удалось загрузить данные панели. Пожалуйста, попробуйте снова.", retry: "Попробовать снова" },
  he: { title: "משהו השתבש", description: "טעינת נתוני לוח המחוונים נכשלה. אנא נסה שוב.", retry: "נסה שוב" },
  ar: { title: "حدث خطأ ما", description: "فشل في تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى.", retry: "حاول مرة أخرى" },
  hi: { title: "कुछ गलत हो गया", description: "डैशबोर्ड डेटा लोड करने में विफल। कृपया पुनः प्रयास करें।", retry: "पुनः प्रयास करें" },
  zh: { title: "出了点问题", description: "加载仪表盘数据失败。请重试。", retry: "重试" },
};

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/");
  const locale = segments[1];
  return dashboardErrorStrings[locale] ? locale : "en";
}

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const strings = dashboardErrorStrings[locale] ?? dashboardErrorStrings.en;

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
