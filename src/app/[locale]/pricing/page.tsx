"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Show, SignUpButton } from "@clerk/nextjs";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

/**
 * Pricing Page Component
 *
 * A client-side rendered page that displays pricing tiers for the application.
 * Features:
 * - Monthly/Yearly billing toggle with animated transitions
 * - Dynamic pricing cards with features list
 * - Conditional rendering based on authentication state
 * - Internationalization support
 * - Animated number transitions for prices
 */

// Define available billing frequencies as a tuple type for type safety
const FREQUENCIES = ["monthly", "yearly"] as const;
type Frequency = (typeof FREQUENCIES)[number];

/**
 * PricingTier Interface
 * Defines the structure for each pricing plan with:
 * - Basic information (name, description)
 * - Feature list
 * - Pricing for different billing frequencies
 * - Call-to-action button configuration
 * - Optional flag for unreleased tiers
 */
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

/**
 * Pricing configuration data
 * Defines two tiers:
 * 1. Free tier with basic features
 * 2. Premium tier (marked as coming soon) with advanced features
 * Translation keys are used for all user-facing strings
 */
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

/**
 * FrequencyToggle Component
 *
 * Renders a toggle button group for switching between monthly and yearly billing.
 * Features:
 * - Animated selection pill
 * - Savings badge for yearly billing
 * - Internationalized labels
 */
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
          {/* Display savings badge for yearly plan */}
          {f === "yearly" && (
            <span className="relative z-10 rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {t("savePercent")}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * Main Pricing Page Component
 *
 * Renders a responsive pricing page with:
 * - Billing frequency toggle
 * - Pricing cards grid
 * - Dynamic CTAs based on authentication state
 * - Animated price transitions
 * - Coming soon badges for unreleased tiers
 */
export default function PricingPage() {
  // Track the selected billing frequency (monthly/yearly)
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const t = useTranslations("pricing");
  const tTiers = useTranslations("pricing.tiers");

  return (
    <section className="flex flex-col items-center gap-10 py-16">
      {/* Header section with title and billing frequency toggle */}
      <div className="space-y-7 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-medium md:text-5xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>
        <FrequencyToggle frequency={frequency} onChange={setFrequency} />
      </div>

      {/* Responsive grid layout for pricing tier cards */}
      <div className="container mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.name}
            className={tier.isComingSoon ? "relative opacity-60" : "relative"}
          >
            {/* Conditional rendering of "Coming Soon" badge for unreleased tiers */}
            {tier.isComingSoon && (
              <div className="absolute -top-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                {t("comingSoon")}
              </div>
            )}

            {/* Pricing card with hover and premium styling effects */}
            <Card
              className={`relative flex flex-col overflow-hidden border transition-all duration-300 ${
                tier.isComingSoon
                  ? "border-2 border-primary shadow-lg hover:shadow-xl"
                  : "shadow hover:shadow-lg"
              }`}
            >
              {/* Decorative gradient background for premium tiers */}
              {tier.isComingSoon && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(147,51,234,0.35),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.35),rgba(0,0,0,0))]" />
              )}

              {/* Card header with tier name and description */}
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl">
                  {tTiers(`${tier.name}.name`)}
                </CardTitle>
                <CardDescription>
                  {tTiers(`${tier.name}.description`)}
                </CardDescription>
              </CardHeader>

              {/* Card content with pricing and features */}
              <CardContent className="relative z-10 grow">
                {/* Animated price display with NumberFlow component */}
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

                  {/* Display monthly price calculation for yearly plans */}
                  {frequency === "yearly" && tier.price.yearly > 0 && (
                    <div className="mt-1.5 text-sm text-muted-foreground">
                      {t("billing.perMonth", {
                        0: (tier.price.yearly / 12).toFixed(2),
                      })}
                    </div>
                  )}
                </div>

                {/* Feature list with checkmark icons */}
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{tTiers(`${tier.name}.features.${i}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Card footer with CTA buttons and authentication state handling */}
              <CardFooter className="flex flex-col">
                {tier.isComingSoon ? (
                  // Coming soon tier CTA
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
                  // Active tier CTA with authentication state handling
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
                    {/* <SignedOut>
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
                    </SignedOut> */}
                    <Show when="signed-in">
                      <Button size="lg" className="w-full" asChild>
                        <Link href="/twig">{t("goToTwig")}</Link>
                      </Button>
                    </Show>
                    {/* <SignedIn>
                      <Button size="lg" className="w-full" asChild>
                        <Link href="/twig">{t("goToTwig")}</Link>
                      </Button>
                    </SignedIn> */}
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
