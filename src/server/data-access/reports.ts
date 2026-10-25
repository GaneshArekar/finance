import { connectToDatabase } from "@/lib/mongodb";
import { Transaction, Account } from "@/models";
import {
  calculateIncome,
  calculateExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  calculateCategoryBreakdown,
  getPeriodDateRange,
  PeriodFilter,
  round2,
  TransactionItem,
} from "@/lib/finance-calculations";

export async function getDetailedReport(
  ownerId: string,
  period: PeriodFilter = "this_month",
  customStart?: string,
  customEnd?: string
) {
  await connectToDatabase();

  const { startDate, endDate } = getPeriodDateRange(period, customStart, customEnd);

  // 1. Current period transactions
  const currentTxs = await Transaction.find({
    ownerId,
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 }).lean();

  const currentFormatted: TransactionItem[] = currentTxs.map((t) => ({
    amount: t.amount,
    type: t.type,
    category: t.categoryName,
    categoryId: t.categoryId?.toString(),
    accountId: t.accountId.toString(),
    toAccountId: t.toAccountId?.toString(),
    date: t.date,
    isDeleted: t.isDeleted,
  }));

  const income = calculateIncome(currentFormatted);
  const expenses = calculateExpenses(currentFormatted);
  const netSavings = calculateNetSavings(income, expenses);
  const savingsRate = calculateSavingsRate(income, expenses);

  // 2. Previous period calculation for comparison
  const durationMs = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  const prevTxs = await Transaction.find({
    ownerId,
    isDeleted: false,
    date: { $gte: prevStartDate, $lte: prevEndDate },
  }).lean();

  const prevFormatted: TransactionItem[] = prevTxs.map((t) => ({
    amount: t.amount,
    type: t.type,
    category: t.categoryName,
    date: t.date,
  }));

  const prevIncome = calculateIncome(prevFormatted);
  const prevExpenses = calculateExpenses(prevFormatted);
  const prevNetSavings = calculateNetSavings(prevIncome, prevExpenses);

  const incomeChange = prevIncome > 0 ? round2(((income - prevIncome) / prevIncome) * 100) : 0;
  const expenseChange = prevExpenses > 0 ? round2(((expenses - prevExpenses) / prevExpenses) * 100) : 0;

  // 3. Category Breakdown
  const categoryBreakdown = calculateCategoryBreakdown(currentFormatted, "expense");
  const incomeCategoryBreakdown = calculateCategoryBreakdown(currentFormatted, "income");

  // 4. Daily / Monthly timeline aggregation for charts
  const timelineMap = new Map<string, { date: string; income: number; expense: number; net: number }>();

  for (const tx of currentTxs) {
    if (tx.type === "transfer") continue;
    const dateKey = new Date(tx.date).toISOString().split("T")[0];
    const existing = timelineMap.get(dateKey) || { date: dateKey, income: 0, expense: 0, net: 0 };
    if (tx.type === "income") {
      existing.income += tx.amount;
    } else if (tx.type === "expense") {
      existing.expense += tx.amount;
    }
    existing.net = round2(existing.income - existing.expense);
    timelineMap.set(dateKey, existing);
  }

  const timeline = Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    summary: {
      income,
      expenses,
      netSavings,
      savingsRate,
      transactionCount: currentTxs.length,
    },
    comparison: {
      prevIncome,
      prevExpenses,
      prevNetSavings,
      incomeChange,
      expenseChange,
    },
    categoryBreakdown,
    incomeCategoryBreakdown,
    timeline,
  };
}

/**
 * Escapes CSV values conforming to RFC 4180
 */
export function escapeCsvField(val: string | number | undefined | null): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, quote, or newline, escape quotes with double quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates properly formatted and escaped CSV for transactions
 */
export async function generateTransactionsCsv(
  ownerId: string,
  period: PeriodFilter = "this_month",
  customStart?: string,
  customEnd?: string
): Promise<string> {
  await connectToDatabase();
  const { startDate, endDate } = getPeriodDateRange(period, customStart, customEnd);

  const transactions = await Transaction.find({
    ownerId,
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 }).lean();

  const headers = [
    "Date",
    "Description",
    "Type",
    "Category",
    "Account",
    "To Account",
    "Amount",
    "Payment Method",
    "Notes",
  ];

  const rows = transactions.map((tx) => [
    escapeCsvField(new Date(tx.date).toISOString().split("T")[0]),
    escapeCsvField(tx.description),
    escapeCsvField(tx.type),
    escapeCsvField(tx.categoryName || "General"),
    escapeCsvField(tx.accountName || ""),
    escapeCsvField(tx.toAccountName || ""),
    escapeCsvField(tx.amount.toFixed(2)),
    escapeCsvField(tx.paymentMethod || ""),
    escapeCsvField(tx.notes || ""),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return csvContent;
}
