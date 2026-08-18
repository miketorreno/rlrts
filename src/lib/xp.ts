export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

export function streakMultiplier(streak: number): number {
  return Math.min(1 + streak * 0.1, 1.5);
}

export function xpForNextLevel(currentXp: number): number {
  const level = levelFromXp(currentXp);
  return (level + 1) * (level + 1) * 100;
}

export function xpInCurrentLevel(currentXp: number): number {
  const level = levelFromXp(currentXp);
  return currentXp - level * level * 100;
}

export function formatXp(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}
