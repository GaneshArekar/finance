import { describe, it, expect } from "vitest";
import {
  calculateIncome,
  calculateExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateBudgetUtilization,
  calculateBudgetRemaining,
  getBudgetStatus,
  calculateAccountBalance,
  calculateCategoryBreakdown,
  getPeriodDateRange,
  round2,
  TransactionItem,
} from "../finance-calculations";

describe("Financial Calculation Rules", () => {
  it("correctly calculates round2 decimal rounding", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10.1234)).toBe(10.12);
    expect(round2(NaN)).toBe(0);
    expect(round2(Infinity)).toBe(0);
  });

  it("calculates income excluding transfers and deleted transactions", () => {
    const txs: TransactionItem[] = [
      { amount: 50000, type: "income", date: "2026-10-01" },
      { amount: 15000, type: "income", date: "2026-10-05" },
      { amount: 2000, type: "income", date: "2026-10-06", isDeleted: true },
      { amount: 10000, type: "transfer", date: "2026-10-07" }, // Transfer must not be counted as income
      { amount: 8000, type: "expense", date: "2026-10-08" },
    ];

    expect(calculateIncome(txs)).toBe(65000);
  });

  it("calculates expenses excluding transfers and deleted transactions", () => {
    const txs: TransactionItem[] = [
      { amount: 50000, type: "income", date: "2026-10-01" },
      { amount: 4500.5, type: "expense", date: "2026-10-02" },
      { amount: 1200.25, type: "expense", date: "2026-10-03" },
      { amount: 800, type: "expense", date: "2026-10-04", isDeleted: true },
      { amount: 10000, type: "transfer", date: "2026-10-05" }, // Transfer must not be counted as expense
    ];

    expect(calculateExpenses(txs)).toBe(5700.75);
  });

  it("calculates net savings and savings rate correctly", () => {
    const income = 100000;
    const expenses = 40000;

    expect(calculateNetSavings(income, expenses)).toBe(60000);
    expect(calculateSavingsRate(income, expenses)).toBe(60);

    // Negative savings
    expect(calculateNetSavings(20000, 35000)).toBe(-15000);
    expect(calculateSavingsRate(20000, 35000)).toBe(0);

    // Zero income
    expect(calculateSavingsRate(0, 5000)).toBe(0);
  });

  it("calculates budget utilization, remaining, and warning thresholds", () => {
    const budgetLimit = 10000;

    // Normal spending (50%)
    const normal = getBudgetStatus(5000, budgetLimit, 80);
    expect(normal.status).toBe("normal");
    expect(normal.utilization).toBe(50);
    expect(normal.remaining).toBe(5000);

    // Warning spending (85% >= 80%)
    const warning = getBudgetStatus(8500, budgetLimit, 80);
    expect(warning.status).toBe("warning");
    expect(warning.utilization).toBe(85);
    expect(warning.remaining).toBe(1500);

    // Exceeded spending (105% >= 100%)
    const exceeded = getBudgetStatus(10500, budgetLimit, 80);
    expect(exceeded.status).toBe("exceeded");
    expect(exceeded.utilization).toBe(105);
    expect(exceeded.remaining).toBe(-500);
  });

  it("correctly calculates account balances with transfers without double counting", () => {
    const accountA = "acc-1"; // Bank
    const accountB = "acc-2"; // Cash

    const txs: TransactionItem[] = [
      { amount: 50000, type: "income", accountId: accountA, date: "2026-10-01" }, // Bank +50,000
      { amount: 10000, type: "transfer", accountId: accountA, toAccountId: accountB, date: "2026-10-02" }, // Bank -10,000, Cash +10,000
      { amount: 2500, type: "expense", accountId: accountB, date: "2026-10-03" }, // Cash -2,500
      { amount: 12000, type: "expense", accountId: accountA, date: "2026-10-04" }, // Bank -12,000
    ];

    const bankBalance = calculateAccountBalance(0, accountA, txs);
    const cashBalance = calculateAccountBalance(500, accountB, txs); // Opening balance 500

    expect(bankBalance).toBe(28000); // 50,000 - 10,000 - 12,000 = 28,000
    expect(cashBalance).toBe(8000); // 500 + 10,000 - 2,500 = 8,000
  });

  it("aggregates category breakdown with percentage", () => {
    const txs: TransactionItem[] = [
      { amount: 6000, type: "expense", category: "Groceries", date: "2026-10-01" },
      { amount: 4000, type: "expense", category: "Dining Out", date: "2026-10-02" },
      { amount: 10000, type: "expense", category: "Groceries", date: "2026-10-03" },
    ];

    const breakdown = calculateCategoryBreakdown(txs, "expense");
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0].category).toBe("Groceries");
    expect(breakdown[0].total).toBe(16000);
    expect(breakdown[0].percentage).toBe(80);
    expect(breakdown[1].category).toBe("Dining Out");
    expect(breakdown[1].total).toBe(4000);
    expect(breakdown[1].percentage).toBe(20);
  });

  it("computes period date range for this_month and last_month properly", () => {
    const ref = new Date("2026-10-25T15:00:00Z");
    const thisMonth = getPeriodDateRange("this_month", undefined, undefined, ref);
    expect(thisMonth.startDate.getMonth()).toBe(9); // October (0-indexed 9)
    expect(thisMonth.startDate.getDate()).toBe(1);

    const lastMonth = getPeriodDateRange("last_month", undefined, undefined, ref);
    expect(lastMonth.startDate.getMonth()).toBe(8); // September (0-indexed 8)
  });
});
