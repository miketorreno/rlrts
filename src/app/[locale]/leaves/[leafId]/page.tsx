"use client";

import { LeafDetails } from "@/components/leaf/leaf-details";
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
        <LeafDetails
          leaf={leaf}
          twig={twig}
          onDelete={() => router.replace("/twig")}
        />
      ) : (
        null
      )}
    </div>
  );
}
