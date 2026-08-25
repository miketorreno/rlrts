"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomCalendarIcon } from "@/components/ui/custom-calendar-icon";
import { CustomTodoIcon } from "@/components/ui/custom-todo-icon";
import { XIcon } from "@/components/ui/x-icon";
import { Link } from "@/i18n/routing";
import { Show } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Activity, Leaf, TreePine, Timer } from "lucide-react";
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
    <div className="flex flex-col items-center space-y-20 px-4 py-16">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-10 text-center md:flex-row md:text-start">
        {/* Text */}
        <div className="max-w-lg space-y-6">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <Show when="signed-out">
            <div className="flex gap-3">
              <Button asChild size="lg">
                <Link href="/pricing">{t("getStarted")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">{t("learnMore")}</Link>
              </Button>
            </div>
          </Show>
          <Show when="signed-in">
            <Button asChild size="lg">
              <Link href="/twig">{t("goToTwig")}</Link>
            </Button>
          </Show>
        </div>

        {/* Animated Tree Hierarchy */}
        <div className="flex w-full max-w-xs flex-col items-center gap-1 md:max-w-sm">
          {TREE_LEVELS.map((level, i) => (
            <motion.div
              key={level.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              {/* Connector line */}
              {i > 0 && (
                <div className="absolute -mt-10 h-10 w-px bg-primary/30" />
              )}
              <div
                className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-sm"
                style={{ marginLeft: `${level.depth * 20}px` }}
              >
                {level.icon && (
                  <level.icon className="h-4 w-4 text-primary" />
                )}
                <span>{level.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Card key={feature.title} className="text-center">
            <CardContent className="space-y-2 pt-2">
              <feature.icon className="mx-auto h-8 w-8 text-primary" />
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Motivation + Preview */}
      <div className="flex w-full max-w-5xl flex-col items-center gap-8">
        <p className="text-center text-sm text-muted-foreground md:text-base">
          {t("hero.motivation")}
        </p>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="relative h-56.25 bg-[url('/screen.png')] bg-cover bg-top dark:bg-[url('/screen-dark.png')] md:col-span-2 md:h-100" />
          <Card className="relative h-100 bg-[url('/screen-mobile.png')] bg-cover bg-top dark:bg-[url('/screen-mobile-dark.png')]" />
        </div>
      </div>
    </div>
  );
}
