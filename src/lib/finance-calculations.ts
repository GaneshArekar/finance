/**
 * Authoritative financial calculation rules for Personal Finance & Budget Management System.
 * Follows decimal precision rules to prevent floating point inaccuracies.
 */

export interface TransactionItem {
  id?: string;
  _id?: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: string;
  categoryId?: string;
  accountId?: string;
  toAccountId?: string;
  date: string | Date;
  isDeleted?: boolean;
}

export interface BudgetLimit {
  categoryId?: string;
  amount: number;
  warningThreshold?: number; // default 80%
}

export type PeriodFilter = "this_month" | "last_month" | "last_30_days" | "custom";

/**
 * Rounds to 2 decimal places reliably
 */
export function round2(num: number): number {
  if (isNaN(num) || !Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates start and end timestamps for a given period
 */
export function getPeriodDateRange(
  period: PeriodFilter,
  customStart?: Date | string,
  customEnd?: Date | string,
  referenceDate: Date = new Date()
): { startDate: Date; endDate: Date } {
  const ref = new Date(referenceDate);

  if (period === "custom") {
    const s = customStart ? new Date(customStart) : new Date(ref.getFullYear(), ref.getMonth(), 1);
    const e = customEnd ? new Date(customEnd) : new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    s.setHours(0, 0, 0, 0);
    e.setHours(23, 59, 59, 999);
    return { startDate: s, endDate: e };
  }

  if (period === "this_month") {
    const startDate = new Date(ref.getFullYear(), ref.getMonth(), 1, 0, 0, 0, 0);
    const endDate = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  if (period === "last_month") {
    const startDate = new Date(ref.getFullYear(), ref.getMonth() - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(ref.getFullYear(), ref.getMonth(), 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  // last_30_days
  const endDate = new Date(ref.getTime());
  endDate.setHours(23, 59, 59, 999);
  const startDate = new Date(ref.getTime());
  startDate.setDate(startDate.getDate() - 29);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
}

/**
 * Checks if a transaction date falls strictly within the [startDate, endDate] window
 */
export function isWithinDateRange(
  txDate: Date | string,
  startDate: Date,
  endDate: Date
): boolean {
  const t = new Date(txDate).getTime();
  return t >= startDate.getTime() && t <= endDate.getTime();
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByPeriod(
  transactions: TransactionItem[],
  startDate: Date,
  endDate: Date
): TransactionItem[] {
  return transactions.filter((tx) => !tx.isDeleted && isWithinDateRange(tx.date, startDate, endDate));
}

/**
 * Total Income: Sum of all non-deleted 'income' transactions in the period.
 * Transfers are explicitly excluded.
 */
export function calculateIncome(
  transactions: TransactionItem[],
  startDate?: Date,
  endDate?: Date
): number {
  let list = transactions.filter((t) => !t.isDeleted && t.type === "income");
  if (startDate && endDate) {
    list = filterTransactionsByPeriod(list, startDate, endDate);
  }
  const sum = list.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  return round2(sum);
}

/**
 * Total Expenses: Sum of all non-deleted 'expense' transactions in the period.
 * Transfers are explicitly excluded.
 */
export function calculateExpenses(
  transactions: TransactionItem[],
  startDate?: Date,
  endDate?: Date
): number {
  let list = transactions.filter((t) => !t.isDeleted && t.type === "expense");
  if (startDate && endDate) {
    list = filterTransactionsByPeriod(list, startDate, endDate);
  }
  const sum = list.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  return round2(sum);
}

/**
 * Net Savings = Income - Expenses
 */
export function calculateNetSavings(income: number, expenses: number): number {
  return round2(income - expenses);
}

/**
 * Savings Rate = (Net Savings / Income) * 100 (when income > 0, otherwise 0)
 */
export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const net = income - expenses;
  if (net <= 0) return 0;
  return round2((net / income) * 100);
}

/**
 * Budget Utilization % = (Eligible Expenses / Budget Limit) * 100
 */
export function calculateBudgetUtilization(spent: number, budgetLimit: number): number {
  if (budgetLimit <= 0) return 0;
  return round2((spent / budgetLimit) * 100);
}

/**
 * Budget Remaining = Budget Limit - Spent
 */
export function calculateBudgetRemaining(spent: number, budgetLimit: number): number {
  return round2(budgetLimit - spent);
}

/**
 * Check if budget is approaching warning threshold (e.g. >= 80%) or exceeded (>= 100%)
 */
export function getBudgetStatus(
  spent: number,
  budgetLimit: number,
  warningThreshold: number = 80
): { status: "normal" | "warning" | "exceeded"; utilization: number; remaining: number } {
  const utilization = calculateBudgetUtilization(spent, budgetLimit);
  const remaining = calculateBudgetRemaining(spent, budgetLimit);

  if (utilization >= 100) {
    return { status: "exceeded", utilization, remaining };
  }
  if (utilization >= warningThreshold) {
    return { status: "warning", utilization, remaining };
  }
  return { status: "normal", utilization, remaining };
}

/**
 * Account Balance Calculation
 * Balance = Opening Balance + Inflows (income + transfers received) - Outflows (expenses + transfers sent)
 */
export function calculateAccountBalance(
  openingBalance: number,
  accountId: string,
  transactions: TransactionItem[]
): number {
  let balance = Number(openingBalance) || 0;

  for (const tx of transactions) {
    if (tx.isDeleted) continue;
    const amt = Number(tx.amount) || 0;

    if (tx.accountId === accountId) {
      if (tx.type === "income") {
        balance += amt;
      } else if (tx.type === "expense" || tx.type === "transfer") {
        balance -= amt;
      }
    }

    // Inflow from transfer where this account is the recipient
    if (tx.type === "transfer" && tx.toAccountId === accountId) {
      balance += amt;
    }
  }

  return round2(balance);
}

/**
 * Category-wise breakdown calculation
 */
export interface CategoryBreakdown {
  category: string;
  categoryId?: string;
  total: number;
  percentage: number;
  count: number;
  color?: string;
}

export function calculateCategoryBreakdown(
  transactions: TransactionItem[],
  type: "income" | "expense" = "expense"
): CategoryBreakdown[] {
  const eligible = transactions.filter((t) => !t.isDeleted && t.type === type);
  const total = eligible.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const groupMap = new Map<string, { total: number; count: number; categoryId?: string }>();

  for (const tx of eligible) {
    const key = tx.category || "Uncategorized";
    const existing = groupMap.get(key) || { total: 0, count: 0, categoryId: tx.categoryId };
    existing.total += Number(tx.amount) || 0;
    existing.count += 1;
    if (tx.categoryId) existing.categoryId = tx.categoryId;
    groupMap.set(key, existing);
  }

  const breakdown: CategoryBreakdown[] = [];
  groupMap.forEach((val, key) => {
    const catTotal = round2(val.total);
    const percentage = total > 0 ? round2((catTotal / total) * 100) : 0;
    breakdown.push({
      category: key,
      categoryId: val.categoryId,
      total: catTotal,
      percentage,
      count: val.count,
    });
  });

  return breakdown.sort((a, b) => b.total - a.total);
}
