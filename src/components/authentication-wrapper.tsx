"use client";

import { Show, SignInButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface AuthenticationWrapperProps {
  children: React.ReactNode;
}

export function AuthenticationWrapper({
  children,
}: AuthenticationWrapperProps) {
  const t = useTranslations("auth");
  return (
    <>
      <Show when="signed-in">{children}</Show>

      <Show when="signed-out">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">{t("signInPrompt")}</h2>
          <SignInButton mode="modal">
            <Button>{t("signIn")}</Button>
          </SignInButton>
        </div>
      </Show>
    </>
  );
}
