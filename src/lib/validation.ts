import { z } from "zod";

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  type: z.enum(["income", "expense", "transfer"]),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  accountId: z.string().min(1, "Account is required"),
  toAccountId: z.string().optional(),
  date: z.string().or(z.date()),
  description: z.string().min(1, "Description or merchant name is required").max(120),
  paymentMethod: z.enum(["cash", "upi", "card", "bank_transfer", "other"]).default("upi"),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().max(500).optional().default(""),
}).refine(
  (data) => {
    if (data.type === "transfer") {
      return !!data.toAccountId && data.toAccountId !== data.accountId;
    }
    return true;
  },
  {
    message: "Destination account must be different from source account for transfers",
    path: ["toAccountId"],
  }
);

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(["bank", "cash", "wallet", "savings", "investment", "credit"]).default("bank"),
  balance: z.coerce.number().default(0),
  currency: z.string().default("INR"),
  isDefault: z.boolean().default(false),
  color: z.string().default("#10b981"),
  notes: z.string().max(250).optional().default(""),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  type: z.enum(["income", "expense"]),
  icon: z.string().default("tag"),
  color: z.string().default("#10b981"),
});

export const budgetSchema = z.object({
  categoryId: z.string().nullable().optional(),
  categoryName: z.string().default("Overall Monthly"),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format"),
  amount: z.coerce.number().positive("Budget amount must be positive"),
  warningThreshold: z.coerce.number().min(10).max(100).default(80),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(80),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional().nullable(),
  category: z.string().default("General"),
  color: z.string().default("#10b981"),
  notes: z.string().max(300).optional().default(""),
});

export const goalContributionSchema = z.object({
  goalId: z.string().min(1, "Goal ID is required"),
  amount: z.coerce.number().positive("Contribution amount must be positive"),
  date: z.string().or(z.date()).default(() => new Date().toISOString()),
  note: z.string().max(200).optional().default(""),
});

export const recurringRuleSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  categoryId: z.string().optional(),
  categoryName: z.string().default("General"),
  accountId: z.string().min(1, "Account is required"),
  description: z.string().min(1, "Description is required").max(100),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().or(z.date()),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const filterParamsSchema = z.object({
  period: z.enum(["this_month", "last_month", "last_30_days", "custom"]).default("this_month"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["income", "expense", "transfer", "all"]).default("all"),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date", "amount", "description"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
