"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CustomCalendarIcon } from "@/components/ui/custom-calendar-icon";
import { CustomTodoIcon } from "@/components/ui/custom-todo-icon";
import { XIcon } from "@/components/ui/x-icon";
import { Link } from "@/i18n/routing";
import { Show } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Leaf,
  Sprout,
  Timer,
  TreePine,
} from "lucide-react";
import { useTranslations } from "next-intl";

const TREE_LEVELS = [
  { label: "Trunks", icon: TreePine, depth: 0 },
  { label: "Limbs", depth: 1 },
  { label: "Branches", depth: 2 },
  { label: "Twigs", depth: 3 },
  { label: "Leaves", icon: Leaf, depth: 4 },
];

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 pb-16 pt-20 md:pb-24 md:pt-28">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row md:items-start md:text-start">
          {/* Text Content */}
          <div className="max-w-xl space-y-6 text-center md:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Sprout className="h-4 w-4" />
              {t("hero.subtitle")}
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              {t("hero.title")}
            </h1>

            <p className="text-lg text-muted-foreground md:text-xl">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center md:justify-start">
              <Show when="signed-out">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/pricing">
                    {t("getStarted")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/about">{t("learnMore")}</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/twig">
                    {t("goToTwig")}
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </Show>
            </div>
          </div>

          {/* Animated Tree Hierarchy */}
          <div className="relative flex w-full max-w-xs flex-col items-center gap-0 md:max-w-sm">
            {TREE_LEVELS.map((level, i) => (
              <motion.div
                key={level.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.2 * i,
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="relative flex items-center"
              >
                {/* Connector line */}
                {i > 0 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2 * i - 0.1, duration: 0.3 }}
                    className="absolute -top-3 left-5 h-3 w-px origin-top bg-primary/30 rtl:left-auto rtl:right-5"
                  />
                )}

                <div
                  className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium shadow-sm transition-shadow hover:shadow-md"
                  style={{ marginLeft: `${level.depth * 24}px` }}
                >
                  {level.icon && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <level.icon className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  {!level.icon && (
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                  )}
                  <span>{level.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="w-full px-4 py-16">
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: CustomCalendarIcon,
              title: t("hero.features.visualTracking.title"),
              desc: (
                <>
                  {t("hero.features.visualTracking.description.part1")}{" "}
                  <XIcon className="inline h-4 w-4 fill-red-500" />{" "}
                  {t("hero.features.visualTracking.description.part2")}
                </>
              ),
            },
            {
              icon: CustomTodoIcon,
              title: t("hero.features.multiHabit.title"),
              desc: t("hero.features.multiHabit.description"),
            },
            {
              icon: Activity,
              title: t("hero.features.yearlyGrid.title"),
              desc: t("hero.features.yearlyGrid.description"),
            },
            {
              icon: Timer,
              title: t("hero.features.timedTasks.title"),
              desc: t("hero.features.timedTasks.description"),
            },
          ].map((feature) => (
            <Card key={feature.title} className="text-center transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Motivation + Preview */}
      <section className="w-full max-w-5xl px-4 pb-20">
        <div className="flex flex-col items-center gap-8">
          <p className="text-center text-sm text-muted-foreground md:text-base">
            {t("hero.motivation")}
          </p>
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="relative h-56.25 bg-[url('/screen.png')] bg-cover bg-top dark:bg-[url('/screen-dark.png')] md:col-span-2 md:h-100" />
            <Card className="relative h-100 bg-[url('/screen-mobile.png')] bg-cover bg-top dark:bg-[url('/screen-mobile-dark.png')]" />
          </div>
        </div>
      </section>
    </div>
  );
}
