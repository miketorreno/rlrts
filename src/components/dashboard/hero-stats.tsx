"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, Trophy, CheckCircle } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";

interface HeroStatsProps {
  xpProfile: {
    level: number;
    lifetimeXp: number;
    currentStreak: number;
    longestStreak: number;
    xpForNextLevel: number;
    xpInCurrentLevel: number;
  };
  todayProgress: {
    habitsDone: number;
    totalHabits: number;
    todosDone: number;
    totalTodos: number;
  };
}

export function HeroStats({ xpProfile, todayProgress }: HeroStatsProps) {
  const t = useTranslations("dashboard");

  const level = xpProfile.level;
  const lifetimeXp = xpProfile.lifetimeXp;
  const currentStreak = xpProfile.currentStreak;
  const longestStreak = xpProfile.longestStreak;
  const xpInLevel = xpProfile.xpInCurrentLevel;
  const xpForNext = xpProfile.xpForNextLevel;
  const progressPercent = xpForNext > 0 ? Math.min((xpInLevel / xpForNext) * 100, 100) : 0;

  const habitsDone = todayProgress.habitsDone;
  const todosDone = todayProgress.todosDone;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Level & XP Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0 }}
      >
        <Card className="bg-primary text-primary-foreground border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-white/20 rounded-full p-2">
                <Award className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {t("level")}
              </Badge>
            </div>
            <div className="mt-4">
              <NumberFlow value={level} className="text-3xl font-bold" />
              <p className="text-white/80 text-sm mt-1">{lifetimeXp.toLocaleString()} XP</p>
            </div>
            <div className="mt-3">
              <Progress
                value={progressPercent}
                className="h-2 bg-white/30 [&>[data-slot=progress-indicator]]:bg-white"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="bg-accent text-accent-foreground border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-white/20 rounded-full p-2">
                <Flame className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-white/30 text-white">
                {t("currentStreak")}
              </Badge>
            </div>
            <div className="mt-4">
              <NumberFlow value={currentStreak} className="text-3xl font-bold" />
              <p className="text-white/80 text-sm mt-1">{t("days")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Longest Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-accent text-accent-foreground border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-white/20 rounded-full p-2">
                <Trophy className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-white/30 text-white">
                {t("longestStreak")}
              </Badge>
            </div>
            <div className="mt-4">
              <NumberFlow value={longestStreak} className="text-3xl font-bold" />
              <p className="text-white/80 text-sm mt-1">{t("days")}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="bg-primary text-primary-foreground border-0 hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-white/20 rounded-full p-2">
                <CheckCircle className="h-6 w-6" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {t("todaysProgress")}
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <NumberFlow value={habitsDone} className="text-3xl font-bold" />
                <span className="text-white/70 text-sm">{t("habitsCompleted")}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <NumberFlow value={todosDone} className="text-lg font-semibold" />
                <span className="text-white/70 text-sm">{t("todosCompleted")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
