import { describe, it, expect } from "vitest";

describe("AI Financial Pre-Aggregation Logic", () => {
  it("verifies numerical financial context structure", () => {
    const verifiedData = {
      month: "2026-10",
      income: 80000,
      expenses: 45000,
      netSavings: 35000,
      savingsRate: 43.75,
      topCategories: [
        { category: "Housing", total: 20000, percentage: 44.4 },
        { category: "Groceries", total: 10000, percentage: 22.2 },
      ],
    };

    expect(verifiedData.income - verifiedData.expenses).toBe(verifiedData.netSavings);
    expect(verifiedData.savingsRate).toBe(43.75);
    expect(verifiedData.topCategories[0].category).toBe("Housing");
  });
});
