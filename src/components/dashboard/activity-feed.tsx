"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, CheckSquare } from "lucide-react";

export function ActivityFeed() {
  const t = useTranslations("dashboard");
  const events = useQuery(api.xp.getRecentEvents, {});

  const now = useMemo(() => new Date().getTime(), []);

  function formatTime(timestamp: number): string {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {t("recentActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!events ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  {event.source === "habit" ? (
                    <Leaf className="h-4 w-4 text-green-500" />
                  ) : (
                    <CheckSquare className="h-4 w-4 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{event.sourceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary">
                  +{event.amount} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
