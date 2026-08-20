"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function ActivityFeed({ recentEvents }: ActivityFeedProps) {
  const t = useTranslations("dashboard");

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
      <CardContent className="max-h-[400px] overflow-y-auto">
        {recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
        ) : (
          <div>
            {recentEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${event.source === "habit" ? "bg-green-500" : "bg-blue-500"}`}
                  />
                  <div>
                    <p className="text-sm font-medium">{event.sourceName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.createdAt)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  +{event.amount} XP
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
