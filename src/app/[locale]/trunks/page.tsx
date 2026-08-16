"use client";

import { TrunkList } from "@/components/trunk/trunk-list";
import { useRouter } from "@/i18n/routing";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../../../convex/_generated/api";

export default function TrunksPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const trunks = useQuery(api.trunks.list, isAuthenticated ? {} : "skip");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl pt-16">
      <TrunkList trunks={trunks} />
    </div>
  );
}
