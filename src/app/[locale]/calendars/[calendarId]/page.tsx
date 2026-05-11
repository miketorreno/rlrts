/**
 * Dynamic calendar details page that displays information for a specific calendar.
 * Route: /[locale]/calendars/[calendarId]
 *
 * This page uses dynamic routing with two parameters:
 * - locale: For internationalization support
 * - calendarId: Unique identifier for the calendar from Convex DB
 */
import { CalendarDetails } from "@/components/calendar/calendar-details";
import { Id } from "../../../../../convex/_generated/dataModel";

// import { Id } from "@server/convex/_generated/dataModel";

// Props interface for the dynamic route parameters
interface PageProps {
  params: Promise<{
    locale: string;
    calendarId: Id<"calendars">; // Strongly typed Convex document ID
  }>;
}

/**
 * Calendar page component that renders details for a specific calendar.
 * Awaits the resolution of dynamic route parameters before rendering.
 */
export default async function CalendarPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <CalendarDetails calendarId={resolvedParams.calendarId} />;
}

// Disable static optimization to ensure fresh data on each request
export const dynamic = "force-dynamic";
