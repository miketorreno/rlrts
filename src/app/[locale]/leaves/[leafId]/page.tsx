"use client";

import { LeafDetails } from "@/components/leaf/leaf-details";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvexAuth, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

// import { api } from "@server/convex/_generated/api";
// import { Id } from "@server/convex/_generated/dataModel";

/**
 * Leaf Details Page
 *
 * Client component that displays detailed information for a specific leaf.
 * Uses dynamic routing to fetch leaf data based on the leafId parameter.
 *
 * Key features:
 * - Fetches leaf and associated twig data
 * - Handles loading states with skeleton UI
 * - Redirects to twig if leaf not found
 * - Renders LeafDetails component with edit/delete capabilities
 */
export default function LeafPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const params = useParams();
  const router = useRouter();
  const leafId = params.leafId as Id<"leaves">;

  // Always call hooks unconditionally
  const leaf = useQuery(api.leaves.get, { id: leafId });
  const twig = useQuery(api.twigs.get, leaf ? { id: leaf.twigId } : "skip");

  // Handle redirects in useEffect
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    } else if (leaf === null) {
      router.replace("/twig");
    }
  }, [isLoading, isAuthenticated, leaf, router]);

  // Show loading state while checking auth
  if (isLoading || (!isLoading && !isAuthenticated)) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-7xl">
      {leaf && twig ? (
        // Render leaf details when data is available
        <LeafDetails
          leaf={leaf}
          twig={twig}
          onDelete={() => router.replace("/twig")}
        />
      ) : (
        // Show skeleton loading state while data is being fetched
        <>
          {/* Back button skeleton */}
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Main content skeleton */}
          <div className="mx-auto max-w-5xl p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="mb-8 h-8 w-48" />
              <Skeleton className="mb-8 h-[150px] w-[600px]" />
            </div>
          </div>

          {/* Form skeleton */}
          <div className="mx-auto max-w-xl p-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
