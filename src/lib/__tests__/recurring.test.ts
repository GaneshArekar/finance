import { describe, it, expect } from "vitest";
import { computeNextOccurrence } from "../../server/data-access/recurring";

describe("Recurring Rules Schedule Progression", () => {
  it("advances daily recurrence by 1 day", () => {
    const base = new Date("2026-10-01T10:00:00Z");
    const next = computeNextOccurrence(base, "daily");
    expect(next.getDate()).toBe(2);
    expect(next.getMonth()).toBe(9);
  });

  it("advances weekly recurrence by 7 days", () => {
    const base = new Date("2026-10-01T10:00:00Z");
    const next = computeNextOccurrence(base, "weekly");
    expect(next.getDate()).toBe(8);
  });

  it("advances monthly recurrence by 1 month", () => {
    const base = new Date("2026-10-15T10:00:00Z");
    const next = computeNextOccurrence(base, "monthly");
    expect(next.getMonth()).toBe(10); // November
    expect(next.getDate()).toBe(15);
  });

  it("advances yearly recurrence by 1 year", () => {
    const base = new Date("2026-10-15T10:00:00Z");
    const next = computeNextOccurrence(base, "yearly");
    expect(next.getFullYear()).toBe(2027);
  });
});
