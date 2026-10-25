import { describe, it, expect } from "vitest";
import { transactionSchema, budgetSchema, accountSchema } from "../validation";

describe("Input Validation & Rejection", () => {
  it("rejects invalid transaction with non-positive amount", () => {
    const invalidTx = {
      amount: -50,
      type: "expense",
      accountId: "acc-123",
      date: new Date().toISOString(),
      description: "Groceries",
    };
    const result = transactionSchema.safeParse(invalidTx);
    expect(result.success).toBe(false);
  });

  it("rejects transfer when source and destination accounts are identical", () => {
    const invalidTransfer = {
      amount: 1000,
      type: "transfer",
      accountId: "acc-123",
      toAccountId: "acc-123", // Same as accountId!
      date: new Date().toISOString(),
      description: "Self transfer",
    };
    const result = transactionSchema.safeParse(invalidTransfer);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues ? result.error.issues[0] : (result.error as any).errors[0];
      expect(issue.message).toContain("Destination account must be different");
    }
  });

  it("accepts valid transfer between two distinct accounts", () => {
    const validTransfer = {
      amount: 5000,
      type: "transfer",
      accountId: "acc-source",
      toAccountId: "acc-target",
      date: new Date().toISOString(),
      description: "ATM withdrawal to cash",
    };
    const result = transactionSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
  });

  it("rejects budget with invalid month format", () => {
    const invalidBudget = {
      month: "2026/10", // wrong format
      amount: 25000,
    };
    const result = budgetSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });

  it("accepts valid budget with YYYY-MM format", () => {
    const validBudget = {
      month: "2026-10",
      amount: 25000,
      warningThreshold: 85,
    };
    const result = budgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  it("rejects account with empty name", () => {
    const invalidAccount = {
      name: "",
      type: "bank",
      balance: 1000,
    };
    const result = accountSchema.safeParse(invalidAccount);
    expect(result.success).toBe(false);
  });
});
