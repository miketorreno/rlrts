"use client";

import { LimbList } from "@/components/limb/limb-list";
import { useRouter } from "@/i18n/routing";
import { useConvexAuth, useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

function LimbsPageContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trunkParam = searchParams.get("trunkId");

  const trunks = useQuery(api.trunks.list, isAuthenticated ? {} : "skip");

  const selectedTrunkId = useMemo(() => {
    if (!trunks) return null;
    if (trunkParam && trunks.some((trunk) => trunk._id === trunkParam)) {
      return trunkParam as Id<"trunks">;
    }
    return trunks[0]?._id ?? null;
  }, [trunks, trunkParam]);

  const limbs = useQuery(
    api.limbs.list,
    selectedTrunkId ? { trunkId: selectedTrunkId } : "skip",
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
      <LimbList
        trunks={trunks}
        selectedTrunkId={selectedTrunkId}
        onTrunkChange={(trunkId) => router.push(`/limbs?trunkId=${trunkId}`)}
        limbs={limbs}
      />
    </div>
  );
}

export default function LimbsPage() {
  return (
    <Suspense>
      <LimbsPageContent />
    </Suspense>
  );
}
