import { describe, it, expect } from "vitest";
import { periodStart } from "../todos";

function localMidnight(y: number, m: number, d: number): number {
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  return date.getTime();
}

describe("periodStart", () => {
  it("daily cadence returns start of today", () => {
    const now = new Date(2026, 2, 15, 14, 30, 0).getTime();
    const result = periodStart("daily", now);
    expect(result).toBe(localMidnight(2026, 3, 15));
  });

  it("daily cadence at midnight returns same day start", () => {
    const now = new Date(2026, 2, 15, 0, 0, 0).getTime();
    const result = periodStart("daily", now);
    expect(result).toBe(localMidnight(2026, 3, 15));
  });

  it("weekly cadence returns Monday start of current week", () => {
    // Wednesday March 18
    const now = new Date(2026, 2, 18, 14, 30, 0).getTime();
    const result = periodStart("weekly", now);
    expect(result).toBe(localMidnight(2026, 3, 16)); // Monday
  });

  it("weekly cadence on Monday returns that Monday", () => {
    const now = new Date(2026, 2, 16, 14, 30, 0).getTime();
    const result = periodStart("weekly", now);
    expect(result).toBe(localMidnight(2026, 3, 16));
  });

  it("weekly cadence on Sunday returns previous Monday", () => {
    // Sunday March 22
    const now = new Date(2026, 2, 22, 14, 30, 0).getTime();
    const result = periodStart("weekly", now);
    expect(result).toBe(localMidnight(2026, 3, 16)); // Monday March 16
  });
});
