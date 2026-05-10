"use client";

// import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Show, SignInButton } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

/**
 * Client-side authentication wrapper component using Clerk.
 * Conditionally renders content based on user's authentication state.
 * Shows a sign-in prompt for unauthenticated users.
 */

/**
 * Props interface for the AuthenticationWrapper component
 */
interface AuthenticationWrapperProps {
  /** Content to render when user is authenticated */
  children: React.ReactNode;
}

/**
 * Wraps content with authentication checks using Clerk.
 * Shows protected content for authenticated users and a sign-in prompt for others.
 */
export function AuthenticationWrapper({
  children,
}: AuthenticationWrapperProps) {
  const t = useTranslations("auth");
  return (
    <>
      {/* Show content when user is signed in */}

      {/* <SignedIn>{children}</SignedIn> */}
      <Show when="signed-in">{children}</Show>

      {/* Show sign-in prompt when user is not authenticated */}
      <Show when="signed-out">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold">{t("signInPrompt")}</h2>
          {/* Modal sign-in button with custom styling */}
          <SignInButton mode="modal">
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
              {t("signIn")}
            </button>
          </SignInButton>
        </div>
      </Show>
    </>
  );
}
