"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Event {
  _id: string;
  source: string;
  sourceName: string;
  amount: number;
  createdAt: number;
}

interface ActivityFeedProps {
  recentEvents: Event[];
}

function formatTimeAgo(now: number, timestamp: number): string {
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

export function ActivityFeed({ recentEvents }: ActivityFeedProps) {
  const t = useTranslations("dashboard");

  const now = useMemo(() => new Date().getTime(), []);

  const formatTime = useCallback(
    (timestamp: number) => formatTimeAgo(now, timestamp),
    [now],
  );

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {t("recentActivity")}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        {recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
        ) : (
          <div>
            {recentEvents.map((event, index) => (
              <div key={event._id}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        event.source === "habit"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500 text-amber-600 dark:text-amber-400"
                      }
                    >
                      {event.source}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{event.sourceName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(event.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">+{event.amount} XP</Badge>
                </div>
                {index < recentEvents.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
