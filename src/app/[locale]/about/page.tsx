import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Show } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import NextLink from "next/link";

const TECH_STACK = [
  { name: "Next.js 16", variant: "default" as const },
  { name: "Convex", variant: "secondary" as const },
  { name: "Clerk", variant: "outline" as const },
  { name: "Tailwind v4", variant: "secondary" as const },
  { name: "TypeScript", variant: "outline" as const },
  { name: "shadcn/ui", variant: "default" as const },
  { name: "next-intl", variant: "secondary" as const },
  { name: "Framer Motion", variant: "outline" as const },
];

const FEATURE_KEYS = [
  "visualTracking",
  "multiHabit",
  "customThemes",
  "timedTasks",
  "activityGrid",
  "flexibleDuration",
  "responsiveDesign",
  "themeSupport",
  "i18nSupport",
  "openSource",
] as const;

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="container mx-auto w-full max-w-3xl space-y-8 py-16">
      {/* Introduction Card */}
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

      {/* Features Card */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("features.title")}
          </h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-muted-foreground">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex gap-3">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                <div>
                  <strong className="text-primary">
                    {t(`features.${key}.title`)}
                  </strong>
                  <p>{t(`features.${key}.description`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tech Stack Card */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">Tech Stack</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {TECH_STACK.map((tech) => (
              <Badge key={tech.name} variant={tech.variant}>
                {tech.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team / Creator Card */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("openSourceProject.title")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("openSourceProject.description")}
          </p>
          <div className="flex items-end gap-2">
            <div className="rounded-3xl rounded-br-none bg-muted p-4">
              <p className="italic text-muted-foreground">
                {t("openSourceProject.creatorQuote")}
              </p>
            </div>
            <Avatar size="lg">
              <AvatarImage src="https://avatars.githubusercontent.com/u/8214158?s=100" />
              <AvatarFallback>IA</AvatarFallback>
            </Avatar>
          </div>
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
      </Card>

      {/* Seinfeld Strategy Card */}
      <Card className="p-4 shadow">
        <CardHeader>
          <h2 className="font-heading text-2xl font-bold">
            {t("seinfeldStrategy.title")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video w-full md:w-2/3">
            <Image
              src="/never-miss-twice.jpg"
              sizes=""
              alt="Never miss twice calendar visualization"
              fill
              className="rounded object-cover"
            />
          </div>
          <div>
            <p className="text-muted-foreground">
              {t("seinfeldStrategy.description")}
            </p>
            <blockquote className="my-6 border-l-2 pl-6 italic text-muted-foreground rtl:border-r-2 rtl:border-l-0 rtl:pl-0 rtl:pr-6">
              {t("seinfeldStrategy.quote")}
            </blockquote>
            <h3 className="mb-6 mt-6 text-xl font-bold">
              {t("seinfeldStrategy.whyItWorks.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("seinfeldStrategy.whyItWorks.description")}
            </p>
            <div className="mt-6 rounded-3xl bg-muted p-4">
              <h4 className="flex justify-center font-bold">
                {t("seinfeldStrategy.whyItWorks.principles.title")}
              </h4>
              <ul className="mt-2 list-disc pl-6 text-muted-foreground rtl:pl-0 rtl:pr-6">
                {[0, 1, 2, 3].map((index) => (
                  <li key={index}>
                    {t(`seinfeldStrategy.whyItWorks.principles.items.${index}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
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

      {/* CTA */}
      <div className="flex justify-center">
        <Show when="signed-in">
          <Button asChild size="lg">
            <Link href="/twig">{t("goToTwig")}</Link>
          </Button>
        </Show>
        <Show when="signed-out">
          <Button asChild size="lg">
            <Link href="/pricing">{t("getStarted")}</Link>
          </Button>
        </Show>
      </div>
    </div>
  );
}
