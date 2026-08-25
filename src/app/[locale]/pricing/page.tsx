"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Show, SignUpButton } from "@clerk/nextjs";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const FREQUENCIES = ["monthly", "yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

interface PricingTier {
  name: string;
  description: string;
  features: string[];
  price: {
    monthly: number;
    yearly: number;
  };
  cta: {
    text: string;
    href?: string;
  };
  isComingSoon?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "free",
    description: "free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: ["free.features.0", "free.features.1", "free.features.2"],
    cta: {
      text: "free.cta",
      href: "/twig",
    },
  },
  {
    name: "premium",
    description: "premium",
    price: {
      monthly: 2.99,
      yearly: 19.99,
    },
    features: [
      "premium.features.0",
      "premium.features.1",
      "premium.features.2",
      "premium.features.3",
    ],
    cta: {
      text: "premium.cta",
    },
    isComingSoon: true,
  },
];

function FrequencyToggle({
  frequency,
  onChange,
}: {
  frequency: Frequency;
  onChange: (f: Frequency) => void;
}) {
  const t = useTranslations("pricing.billing");

  return (
    <div className="mx-auto flex w-fit rounded-xl bg-secondary p-1">
      {FREQUENCIES.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className="relative flex items-center gap-2.5 px-2 py-2 text-sm font-semibold capitalize transition-colors duration-200"
        >
          <span className="relative z-10">{t(f)}</span>
          {frequency === f && (
            <motion.span
              layoutId="pill"
              className="absolute inset-0 z-0 rounded-md bg-background shadow-sm"
              transition={{
                type: "tween",
                duration: 1,
                ease: [0, 0.7, 0.1, 1],
              }}
            />
          )}
          {f === "yearly" && (
            <Badge variant="secondary" className="relative z-10 text-xs">
              {t("savePercent")}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const t = useTranslations("pricing");
  const tTiers = useTranslations("pricing.tiers");

  return (
    <section className="flex flex-col items-center gap-10 py-16">
      {/* Header */}
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-medium md:text-5xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <FrequencyToggle frequency={frequency} onChange={setFrequency} />
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
        {PRICING_TIERS.map((tier, idx) => (
          <div key={tier.name} className="relative">
            {tier.isComingSoon && (
              <Badge
                variant="default"
                className="absolute -top-3 left-1/2 z-50 -translate-x-1/2"
              >
                {t("comingSoon")}
              </Badge>
            )}

            <Card
              className={`relative flex flex-col overflow-hidden border transition-all duration-300 ${
                tier.isComingSoon
                  ? "border-2 border-primary opacity-60 shadow-lg hover:shadow-xl"
                  : "shadow hover:shadow-lg"
              }`}
            >
              {tier.isComingSoon && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.35),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.35),rgba(0,0,0,0))]" />
              )}

              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl">
                  {tTiers(`${tier.name}.name`)}
                </CardTitle>
                <CardDescription>
                  {tTiers(`${tier.name}.description`)}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 grow">
                <div className="relative mb-6">
                  <div className="text-4xl font-medium">
                    <NumberFlow
                      format={{
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                        currencyDisplay: "narrowSymbol",
                      }}
                      value={tier.price[frequency]}
                    />
                    <span className="text-lg font-normal text-muted-foreground">
                      /{t(`billing.${frequency}`)}
                    </span>
                  </div>
                  {frequency === "yearly" && tier.price.yearly > 0 && (
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      {t("billing.perMonth", {
                        0: (tier.price.yearly / 12).toFixed(2),
                      })}
                    </div>
                  )}
                </div>

                <Separator className="mb-4" />

                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{tTiers(`${tier.name}.features.${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="flex flex-col">
                {tier.isComingSoon ? (
                  <>
                    <Button size="lg" className="w-full" disabled>
                      {tTiers(`${tier.name}.cta`)}
                    </Button>
                    {tier.name === "premium" && (
                      <p className="pt-4 text-center text-sm text-muted-foreground">
                        {tTiers(`${tier.name}.comingSoonMessage`)}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Show when="signed-out">
                      <SignUpButton mode="modal">
                        <Button size="lg" className="w-full" type="button">
                          {tTiers(`${tier.name}.cta`)}
                        </Button>
                      </SignUpButton>
                      {tier.name === "free" && (
                        <p className="mt-4 text-center text-sm text-muted-foreground">
                          {tTiers(`${tier.name}.noCreditCard`)}
                        </p>
                      )}
                    </Show>
                    <Show when="signed-in">
                      <Button size="lg" className="w-full" asChild>
                        <Link href="/twig">{t("goToTwig")}</Link>
                      </Button>
                    </Show>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
