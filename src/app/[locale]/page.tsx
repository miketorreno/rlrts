"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomCalendarIcon } from "@/components/ui/custom-calendar-icon";
import { CustomTodoIcon } from "@/components/ui/custom-todo-icon";
import { XIcon } from "@/components/ui/x-icon";
import { Link } from "@/i18n/routing";
// import { Show, SignedIn, SignedOut } from "@clerk/nextjs";
import { Show } from "@clerk/nextjs";
import { Activity, Timer } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Home component - Landing page of the application
 * Features:
 * - Responsive hero section with title and subtitle
 * - Feature grid showcasing key functionalities
 * - Authentication-aware CTA buttons
 * - Responsive preview images for desktop and mobile
 */
export default function Home() {
  // Initialize translations for the home page namespace
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-center justify-center space-y-16 px-4 py-16 text-center">
      {/* Hero Section */}
      <div className="max-w-lg">
        <h1 className="mb-4 text-2xl font-bold md:text-4xl">
          {t("hero.title")}
        </h1>
        <p className="mx-auto max-w-150 text-muted-foreground md:text-lg">
          {t("hero.subtitle")}
        </p>
      </div>

      {/* Feature Grid - Displays 4 key features with icons and descriptions */}
      <div className="mx-auto grid max-w-xs grid-cols-1 gap-8 px-4 md:max-w-3xl md:grid-cols-2 lg:grid-cols-4">
        {/* Visual Tracking Feature */}
        <div className="space-y-2 text-center">
          <CustomCalendarIcon className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">
            {t("hero.features.visualTracking.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("hero.features.visualTracking.description.part1")}{" "}
            <XIcon className="inline h-4 w-4 fill-red-500" />{" "}
            {t("hero.features.visualTracking.description.part2")}
          </p>
        </div>
        {/* Multi-Habit Tracking Feature */}
        <div className="space-y-2 text-center">
          <CustomTodoIcon className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">
            {t("hero.features.multiHabit.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("hero.features.multiHabit.description")}
          </p>
        </div>
        {/* Yearly Grid Feature */}
        <div className="space-y-2 text-center">
          <Activity className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">
            {t("hero.features.yearlyGrid.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("hero.features.yearlyGrid.description")}
          </p>
        </div>
        {/* Timed Tasks Feature */}
        <div className="space-y-2 text-center">
          <Timer className="mx-auto mb-2 h-8 w-8 text-primary" />
          <h3 className="font-semibold">
            {t("hero.features.timedTasks.title")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("hero.features.timedTasks.description")}
          </p>
        </div>
      </div>

      {/* CTA Section - Shows different buttons based on authentication state */}
      <div className="space-y-4">
        <p className="hidden text-xs text-muted-foreground md:block md:text-sm">
          {t("hero.motivation")}
        </p>

        {/* Authenticated user view */}
        <Show when="signed-in">
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/twig">{t("goToTwig")}</Link>
            </Button>
          </div>
        </Show>
        {/* <SignedIn>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/twig">{t("goToTwig")}</Link>
            </Button>
          </div>
        </SignedIn> */}
        {/* Non-authenticated user view */}
        <Show when="signed-out">
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">{t("getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">{t("learnMore")}</Link>
            </Button>
          </div>
        </Show>
        {/* <SignedOut>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">{t("getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">{t("learnMore")}</Link>
            </Button>
          </div>
        </SignedOut> */}
      </div>

      {/* Preview Section - Responsive images for desktop and mobile views */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 px-4 md:grid-cols-3">
        <Card className="relative h-56.25 bg-[url('/screen.png')] bg-cover bg-top dark:bg-[url('/screen-dark.png')] md:col-span-2 md:h-100" />
        <Card className="relative h-100 bg-[url('/screen-mobile.png')] bg-cover bg-top dark:bg-[url('/screen-mobile-dark.png')]" />
      </div>
    </div>
  );
}
