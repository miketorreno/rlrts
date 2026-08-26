import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { Show } from "@clerk/nextjs";
import { CheckCircle2, ExternalLink, Heart } from "lucide-react";
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
    <div className="container mx-auto w-full max-w-3xl space-y-6 px-4 py-16">
      {/* Introduction */}
      <div className="space-y-4 text-center">
        <h1 className="font-heading text-4xl font-bold md:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {t("intro")}
        </p>
      </div>

      <Separator />

      {/* What It Is */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("whatItIs.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("whatItIs.description")}</p>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("features.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-muted-foreground">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <strong className="text-foreground">
                    {t(`features.${key}.title`)}
                  </strong>
                  <p className="text-sm">{t(`features.${key}.description`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">Tech Stack</CardTitle>
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

      {/* Team / Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("openSourceProject.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t("openSourceProject.description")}
          </p>
          <div className="flex items-end gap-3">
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
          <Button asChild variant="outline" size="lg" className="gap-2">
            <NextLink
              href="https://github.com/ilyaizen/streak-calendar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              {t("openSourceProject.viewOnGithub")}
            </NextLink>
          </Button>
        </CardFooter>
      </Card>

      {/* Seinfeld Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {t("seinfeldStrategy.title")}
          </CardTitle>
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
            <h3 className="mb-4 text-xl font-bold">
              {t("seinfeldStrategy.whyItWorks.title")}
            </h3>
            <p className="text-muted-foreground">
              {t("seinfeldStrategy.whyItWorks.description")}
            </p>
            <div className="mt-6 rounded-2xl bg-muted p-4">
              <h4 className="mb-2 flex justify-center font-bold">
                {t("seinfeldStrategy.whyItWorks.principles.title")}
              </h4>
              <ul className="space-y-1 pl-6 text-muted-foreground rtl:pl-0 rtl:pr-6">
                {[0, 1, 2, 3].map((index) => (
                  <li key={index} className="list-disc">
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
      <div className="flex justify-center pt-4">
        <Show when="signed-in">
          <Button asChild size="lg" className="gap-2">
            <Link href="/twig">
              <Heart className="h-4 w-4" />
              {t("goToTwig")}
            </Link>
          </Button>
        </Show>
        <Show when="signed-out">
          <Button asChild size="lg" className="gap-2">
            <Link href="/pricing">
              {t("getStarted")}
            </Link>
          </Button>
        </Show>
      </div>
    </div>
  );
}
