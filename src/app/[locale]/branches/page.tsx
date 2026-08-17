"use client";

import { BranchList } from "@/components/branch/branch-list";
import { useRouter } from "@/i18n/routing";
import { useConvexAuth, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

function BranchesPageContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const limbParam = searchParams.get("limbId");

  const limbs = useQuery(api.limbs.list, isAuthenticated ? {} : "skip");

  const selectedLimbId = useMemo(() => {
    if (!limbs) return null;
    if (limbParam && limbs.some((limb) => limb._id === limbParam)) {
      return limbParam as Id<"limbs">;
    }
    return limbs[0]?._id ?? null;
  }, [limbs, limbParam]);

  const branches = useQuery(
    api.branches.list,
    selectedLimbId ? { limbId: selectedLimbId } : "skip",
  );

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
      <BranchList
        limbs={limbs}
        selectedLimbId={selectedLimbId}
        onLimbChange={(limbId) => router.push(`/branches?limbId=${limbId}`)}
        branches={branches}
      />
    </div>
  );
}

export default function BranchesPage() {
  return (
    <Suspense>
      <BranchesPageContent />
    </Suspense>
  );
}
