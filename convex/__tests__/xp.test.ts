import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { streakMultiplier, updateStreak } from "../xp";

describe("streakMultiplier", () => {
  it("returns 1.0 for streak 0", () => {
    expect(streakMultiplier(0)).toBe(1.0);
  });

  it("returns 1.1 for streak 1", () => {
    expect(streakMultiplier(1)).toBe(1.1);
  });

  it("returns 1.5 for streak 5", () => {
    expect(streakMultiplier(5)).toBe(1.5);
  });

  it("caps at 1.5 for streak 10", () => {
    expect(streakMultiplier(10)).toBe(1.5);
  });

  it("caps at 1.5 for streak 15", () => {
    expect(streakMultiplier(15)).toBe(1.5);
  });

  it("returns 1.3 for streak 3", () => {
    expect(streakMultiplier(3)).toBe(1.3);
  });
});

describe("updateStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createMockCtx(profiles: Record<string, { _id: string; currentStreak: number; lastCompletionDate?: string }>) {
    const patched: Record<string, Record<string, unknown>> = {};

    return {
      db: {
        query: (table: string) => ({
          filter: () => ({
            first: async () => {
              if (table !== "xpProfiles") return null;
              const entries = Object.values(profiles);
              return entries[0] ?? null;
            },
          }),
        }),
        patch: async (id: string, patch: Record<string, unknown>) => {
          patched[id] = { ...patched[id], ...patch };
          if (profiles["p1"] && id === profiles["p1"]._id) {
            profiles["p1"] = { ...profiles["p1"], ...patch } as (typeof profiles)["p1"];
          }
        },
      },
      _patched: patched,
    };
  }

  it("no-ops when profile does not exist", async () => {
    const ctx = createMockCtx({});
    await updateStreak(ctx as never, "user1");
    expect(Object.keys(ctx._patched)).toHaveLength(0);
  });

  it("no-ops when lastCompletionDate is today", async () => {
    const today = new Date("2026-03-15T12:00:00Z");
    vi.setSystemTime(today);

    const profiles = {
      p1: { _id: "p1", currentStreak: 5, lastCompletionDate: "2026-03-15" },
    };
    const ctx = createMockCtx(profiles);
    await updateStreak(ctx as never, "user1");
    expect(Object.keys(ctx._patched)).toHaveLength(0);
  });

  it("no-ops when lastCompletionDate is yesterday (streak continues)", async () => {
    const today = new Date("2026-03-15T12:00:00Z");
    vi.setSystemTime(today);

    const profiles = {
      p1: { _id: "p1", currentStreak: 5, lastCompletionDate: "2026-03-14" },
    };
    const ctx = createMockCtx(profiles);
    await updateStreak(ctx as never, "user1");
    expect(Object.keys(ctx._patched)).toHaveLength(0);
  });

  it("resets streak to 0 when lastCompletionDate is > 1 day ago", async () => {
    const today = new Date("2026-03-15T12:00:00Z");
    vi.setSystemTime(today);

    const profiles = {
      p1: { _id: "p1", currentStreak: 5, lastCompletionDate: "2026-03-10" },
    };
    const ctx = createMockCtx(profiles);
    await updateStreak(ctx as never, "user1");
    expect(ctx._patched["p1"]).toEqual({ currentStreak: 0 });
  });

  it("resets streak when lastCompletionDate is undefined (first completion)", async () => {
    const today = new Date("2026-03-15T12:00:00Z");
    vi.setSystemTime(today);

    const profiles = {
      p1: { _id: "p1", currentStreak: 1 },
    };
    const ctx = createMockCtx(profiles);
    await updateStreak(ctx as never, "user1");
    expect(ctx._patched["p1"]).toEqual({ currentStreak: 0 });
  });
});
