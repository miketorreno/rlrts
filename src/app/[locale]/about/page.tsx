import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
// import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Show } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";

// About page component that provides information about the Goal Streak application
// Includes sections for app description, features, project info, and the Seinfeld Strategy

export default function AboutPage() {
  const locale = useLocale();
  const t = useTranslations("about");
  const isRTL = locale === "he" || locale === "ar";

  return (
    // Main container with responsive width and vertical spacing
    <div className="container mx-auto w-full max-w-3xl space-y-8 py-16">
      {/* Introduction Card: Overview of Goal Streak */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h1 className="font-heading text-4xl font-bold">{t("title")}</h1>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("intro")}</p>
        </CardContent>
        <CardContent>
          <h2 className="font-heading text-2xl font-bold">
            {t("whatItIs.title")}
          </h2>
          <p className="pt-6 text-muted-foreground">
            {t("whatItIs.description")}
          </p>
        </CardContent>
      </Card>

      {/* Features Card: List of key application capabilities */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("features.title")}
          </h2>
        </CardHeader>
        <CardContent>
          {/* Feature list with primary headings and muted descriptions */}
          <ul className="space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.visualTracking.title")}
                </strong>
                <p>{t("features.visualTracking.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.multiHabit.title")}
                </strong>
                <p>{t("features.multiHabit.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.customThemes.title")}
                </strong>
                <p>{t("features.customThemes.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.timedTasks.title")}
                </strong>
                <p>{t("features.timedTasks.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.activityGrid.title")}
                </strong>
                <p>{t("features.activityGrid.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.flexibleDuration.title")}
                </strong>
                <p>{t("features.flexibleDuration.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.responsiveDesign.title")}
                </strong>
                <p>{t("features.responsiveDesign.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.themeSupport.title")}
                </strong>
                <p>{t("features.themeSupport.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.i18nSupport.title")}
                </strong>
                <p>{t("features.i18nSupport.description")}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
              <div>
                <strong className="text-primary">
                  {t("features.openSource.title")}
                </strong>
                <p>{t("features.openSource.description")}</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Open Source Card: Project information and creator introduction */}
      {/* <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("openSourceProject.title")}
          </h2>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            {t("openSourceProject.description")}
          </p>
          <div className="flex items-end">
            <div
              className={`mt-4 rounded-3xl ${isRTL ? "rounded-bl-none" : "rounded-br-none"} bg-muted p-4`}
            >
              <p className="italic text-muted-foreground">
                {t("openSourceProject.creatorQuote")}
              </p>
            </div>

            <Avatar
              className={`relative top-6 ${isRTL ? "mr-2" : "ml-2"} h-12 w-12`}
            >
              <AvatarImage src="https://avatars.githubusercontent.com/u/8214158?s=100" />
              <AvatarFallback>IA</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
        <CardContent>
          <div className="flex justify-center">
            <a
              href="https://www.buymeacoffee.com/ilyaizen"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                width={217}
                height={60}
                unoptimized
              />
            </a>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button asChild variant="outline" size="lg">
            <NextLink
              href="https://github.com/ilyaizen/streak-calendar"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("openSourceProject.viewOnGithub")}
            </NextLink>
          </Button>
        </CardFooter>
      </Card> */}

      {/* Seinfeld Strategy Card: Explanation of the methodology */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("seinfeldStrategy.title")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual representation of the "Never miss twice" concept */}
          <div className="relative aspect-video w-full md:w-2/3">
            <Image
              src="/never-miss-twice.jpg"
              alt="Never miss twice calendar visualization"
              fill
              className="rounded object-cover"
            />
          </div>

          <div className="">
            {/* Strategy explanation and origin story */}
            <p className="text-muted-foreground">
              {t("seinfeldStrategy.description")}
            </p>

            {/* Direct quote from the strategy's origin */}
            <blockquote
              className={`my-6 ${isRTL ? "border-r-2 pr-6" : "border-l-2 pl-6"} italic text-muted-foreground`}
            >
              {t("seinfeldStrategy.quote")}
            </blockquote>

            {/* Detailed breakdown of why the strategy is successful */}
            <h3 className="mb-6 mt-6 text-xl font-bold">
              {t("seinfeldStrategy.whyItWorks.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("seinfeldStrategy.whyItWorks.description")}
            </p>

            {/* Key principles summary box */}
            <div className="mt-6 rounded-3xl bg-muted p-4">
              <h4 className="flex justify-center font-bold">
                {t("seinfeldStrategy.whyItWorks.principles.title")}
              </h4>
              <ul
                className={`mt-2 list-disc ${isRTL ? "pr-6" : "pl-6"} text-muted-foreground`}
              >
                {[0, 1, 2, 3].map((index) => (
                  <li key={index}>
                    {t(`seinfeldStrategy.whyItWorks.principles.items.${index}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
        {/* Attribution footer */}
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            {t.rich("seinfeldStrategy.attribution", {
              link: (chunks) => (
                <NextLink
                  href={t("seinfeldStrategy.articleUrl")}
                  className="font-bold underline hover:text-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </NextLink>
              ),
            })}
          </p>
        </CardFooter>
      </Card>

      {/* Call-to-action buttons - different options for signed-in vs signed-out users */}
      <div className="flex justify-center">
        <Show when="signed-in">
          <Button asChild size="lg">
            <Link href="/calendar" locale={locale}>
              {t("goToCalendar")}
            </Link>
          </Button>
        </Show>
        {/* <SignedIn>
          <Button asChild size="lg">
            <Link href="/calendar" locale={locale}>
              {t("goToCalendar")}
            </Link>
          </Button>
        </SignedIn> */}
        <Show when="signed-out">
          <Button asChild size="lg">
            <Link href="/pricing" locale={locale}>
              {t("getStarted")}
            </Link>
          </Button>
        </Show>
        {/* <SignedOut>
          <Button asChild size="lg">
            <Link href="/pricing" locale={locale}>
              {t("getStarted")}
            </Link>
          </Button>
        </SignedOut> */}
      </div>
    </div>
  );
}
