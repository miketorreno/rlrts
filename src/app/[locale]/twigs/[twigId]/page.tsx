/**
 * Dynamic twig details page that displays information for a specific twig.
 * Route: /[locale]/twigs/[twigId]
 *
 * This page uses dynamic routing with two parameters:
 * - locale: For internationalization support
 * - twigId: Unique identifier for the twig from Convex DB
 */
import { TwigDetails } from "@/components/twig/twig-details";
import { Id } from "../../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

// Props interface for the dynamic route parameters
interface PageProps {
  params: Promise<{
    locale: string;
    twigId: Id<"twigs">; // Strongly typed Convex document ID
  }>;
}

/**
 * Twig page component that renders details for a specific twig.
 * Awaits the resolution of dynamic route parameters before rendering.
 */
export default async function TwigPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <TwigDetails twigId={resolvedParams.twigId} />;
}

// Disable static optimization to ensure fresh data on each request
export const dynamic = "force-dynamic";
