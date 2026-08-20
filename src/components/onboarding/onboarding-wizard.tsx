"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { StepCreateBranch } from "./step-create-branch";
import { StepCreateLeaf } from "./step-create-leaf";
import { StepCreateLimb } from "./step-create-limb";
import { StepCreateTrunk } from "./step-create-trunk";
import { StepCreateTwig } from "./step-create-twig";

const TOTAL_STEPS = 5;

export function OnboardingWizard() {
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(1);
  const [trunkId, setTrunkId] = useState<string | null>(null);
  const [limbId, setLimbId] = useState<string | null>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [twigId, setTwigId] = useState<string | null>(null);
  const completeOnboarding = useMutation(api.xp.completeOnboarding);

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const handleSkip = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  return (
    <div className="container mx-auto flex max-w-lg flex-col items-center gap-6 pt-16">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">
        {t("progress", { current: step, total: TOTAL_STEPS })}
      </p>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t(`step${step}`)}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <StepCreateTrunk
                  onComplete={(id: string) => {
                    setTrunkId(id);
                    handleNext();
                  }}
                  onSkip={handleSkip}
                />
              )}
              {step === 2 && (
                <StepCreateLimb
                  trunkId={trunkId}
                  onComplete={(id: string) => {
                    setLimbId(id);
                    handleNext();
                  }}
                  onSkip={handleSkip}
                />
              )}
              {step === 3 && (
                <StepCreateBranch
                  limbId={limbId}
                  onComplete={(id: string) => {
                    setBranchId(id);
                    handleNext();
                  }}
                  onSkip={handleSkip}
                />
              )}
              {step === 4 && (
                <StepCreateTwig
                  branchId={branchId}
                  onComplete={(id: string) => {
                    setTwigId(id);
                    handleNext();
                  }}
                  onSkip={handleSkip}
                />
              )}
              {step === 5 && (
                <StepCreateLeaf
                  twigId={twigId}
                  onSkip={handleSkip}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
