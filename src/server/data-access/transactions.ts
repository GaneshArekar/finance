import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction, Account, Category, ITransaction } from "@/models";
import {
  calculateIncome,
  calculateExpenses,
  calculateNetSavings,
  calculateSavingsRate,
  getPeriodDateRange,
  PeriodFilter,
  TransactionItem,
} from "@/lib/finance-calculations";

export interface ListTransactionsParams {
  period?: PeriodFilter;
  startDate?: string;
  endDate?: string;
  type?: "income" | "expense" | "transfer" | "all";
  categoryId?: string;
  accountId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "date" | "amount" | "description";
  sortOrder?: "asc" | "desc";
}

export async function listTransactions(ownerId: string, params: ListTransactionsParams) {
  await connectToDatabase();

  const {
    period = "this_month",
    startDate: customStart,
    endDate: customEnd,
    type = "all",
    categoryId,
    accountId,
    search,
    page = 1,
    limit = 20,
    sortBy = "date",
    sortOrder = "desc",
  } = params;

  const { startDate, endDate } = getPeriodDateRange(period, customStart, customEnd);

  const query: Record<string, unknown> = {
    ownerId,
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate },
  };

  if (type && type !== "all") {
    query.type = type;
  }

  if (categoryId) {
    query.categoryId = new mongoose.Types.ObjectId(categoryId);
  }

  if (accountId) {
    query.$or = [
      { accountId: new mongoose.Types.ObjectId(accountId) },
      { toAccountId: new mongoose.Types.ObjectId(accountId) },
    ];
  }

  if (search && search.trim()) {
    query.description = { $regex: search.trim(), $options: "i" };
  }

  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  const skip = (page - 1) * limit;

  const [transactions, totalCount] = await Promise.all([
    Transaction.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions: transactions as unknown as ITransaction[],
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
    dateRange: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
}

export async function createTransaction(
  ownerId: string,
  data: {
    amount: number;
    type: "income" | "expense" | "transfer";
    categoryId?: string;
    categoryName?: string;
    accountId: string;
    toAccountId?: string;
    date: string | Date;
    description: string;
    paymentMethod?: "cash" | "upi" | "card" | "bank_transfer" | "other";
    tags?: string[];
    notes?: string;
  }
) {
  await connectToDatabase();

  // Validate source account
  const sourceAccount = await Account.findOne({ _id: data.accountId, ownerId });
  if (!sourceAccount) {
    throw new Error("Source account not found or unauthorized");
  }

  let destAccount = null;
  if (data.type === "transfer") {
    if (!data.toAccountId) {
      throw new Error("Destination account is required for transfers");
    }
    if (data.toAccountId === data.accountId) {
      throw new Error("Source and destination accounts must be different");
    }
    destAccount = await Account.findOne({ _id: data.toAccountId, ownerId });
    if (!destAccount) {
      throw new Error("Destination account not found or unauthorized");
    }
  }

  let catName = data.categoryName || "General";
  if (data.categoryId) {
    const cat = await Category.findOne({ _id: data.categoryId, ownerId });
    if (cat) catName = cat.name;
  }

  const txDate = new Date(data.date);

  const tx = await Transaction.create({
    ownerId,
    amount: data.amount,
    type: data.type,
    categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined,
    categoryName: catName,
    accountId: new mongoose.Types.ObjectId(data.accountId),
    accountName: sourceAccount.name,
    toAccountId: data.toAccountId ? new mongoose.Types.ObjectId(data.toAccountId) : undefined,
    toAccountName: destAccount ? destAccount.name : undefined,
    date: txDate,
    description: data.description.trim(),
    paymentMethod: data.paymentMethod || "upi",
    tags: data.tags || [],
    notes: data.notes || "",
    isDeleted: false,
  });

  // Update account balances atomically
  if (data.type === "income") {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: data.amount } });
  } else if (data.type === "expense") {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: -data.amount } });
  } else if (data.type === "transfer" && data.toAccountId) {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: -data.amount } });
    await Account.updateOne({ _id: data.toAccountId, ownerId }, { $inc: { balance: data.amount } });
  }

  return tx.toObject();
}

export async function updateTransaction(
  ownerId: string,
  transactionId: string,
  data: {
    amount: number;
    type: "income" | "expense" | "transfer";
    categoryId?: string;
    accountId: string;
    toAccountId?: string;
    date: string | Date;
    description: string;
    paymentMethod?: "cash" | "upi" | "card" | "bank_transfer" | "other";
    tags?: string[];
    notes?: string;
  }
) {
  await connectToDatabase();

  const existingTx = await Transaction.findOne({ _id: transactionId, ownerId, isDeleted: false });
  if (!existingTx) {
    throw new Error("Transaction not found or unauthorized");
  }

  // 1. Revert previous transaction effect on account balances
  if (existingTx.type === "income") {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: -existingTx.amount } });
  } else if (existingTx.type === "expense") {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: existingTx.amount } });
  } else if (existingTx.type === "transfer" && existingTx.toAccountId) {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: existingTx.amount } });
    await Account.updateOne({ _id: existingTx.toAccountId, ownerId }, { $inc: { balance: -existingTx.amount } });
  }

  // 2. Resolve names
  const sourceAccount = await Account.findOne({ _id: data.accountId, ownerId });
  if (!sourceAccount) throw new Error("Source account not found");

  let destAccount = null;
  if (data.type === "transfer" && data.toAccountId) {
    destAccount = await Account.findOne({ _id: data.toAccountId, ownerId });
  }

  let catName = "General";
  if (data.categoryId) {
    const cat = await Category.findOne({ _id: data.categoryId, ownerId });
    if (cat) catName = cat.name;
  }

  // 3. Update transaction record
  existingTx.amount = data.amount;
  existingTx.type = data.type;
  existingTx.categoryId = data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined;
  existingTx.categoryName = catName;
  existingTx.accountId = new mongoose.Types.ObjectId(data.accountId);
  existingTx.accountName = sourceAccount.name;
  existingTx.toAccountId = data.toAccountId ? new mongoose.Types.ObjectId(data.toAccountId) : undefined;
  existingTx.toAccountName = destAccount ? destAccount.name : undefined;
  existingTx.date = new Date(data.date);
  existingTx.description = data.description.trim();
  if (data.paymentMethod) existingTx.paymentMethod = data.paymentMethod;
  if (data.tags) existingTx.tags = data.tags;
  if (data.notes !== undefined) existingTx.notes = data.notes;

  await existingTx.save();

  // 4. Apply new balance effect
  if (data.type === "income") {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: data.amount } });
  } else if (data.type === "expense") {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: -data.amount } });
  } else if (data.type === "transfer" && data.toAccountId) {
    await Account.updateOne({ _id: data.accountId, ownerId }, { $inc: { balance: -data.amount } });
    await Account.updateOne({ _id: data.toAccountId, ownerId }, { $inc: { balance: data.amount } });
  }

  return existingTx.toObject();
}

export async function deleteTransaction(ownerId: string, transactionId: string) {
  await connectToDatabase();

  const existingTx = await Transaction.findOne({ _id: transactionId, ownerId, isDeleted: false });
  if (!existingTx) {
    throw new Error("Transaction not found or unauthorized");
  }

  // Revert balance effect
  if (existingTx.type === "income") {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: -existingTx.amount } });
  } else if (existingTx.type === "expense") {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: existingTx.amount } });
  } else if (existingTx.type === "transfer" && existingTx.toAccountId) {
    await Account.updateOne({ _id: existingTx.accountId, ownerId }, { $inc: { balance: existingTx.amount } });
    await Account.updateOne({ _id: existingTx.toAccountId, ownerId }, { $inc: { balance: -existingTx.amount } });
  }

  // Soft delete to maintain audit log and prevent historical distortion
  existingTx.isDeleted = true;
  await existingTx.save();

  return { success: true };
}

/**
 * Gets financial summary metrics for a given period
 */
export async function getFinancialSummary(
  ownerId: string,
  period: PeriodFilter = "this_month",
  customStart?: string,
  customEnd?: string
) {
  await connectToDatabase();

  const { startDate, endDate } = getPeriodDateRange(period, customStart, customEnd);

  // Fetch all non-deleted transactions for the period
  const rawTxs = await Transaction.find({
    ownerId,
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  const formattedTxs: TransactionItem[] = rawTxs.map((t) => ({
    amount: t.amount,
    type: t.type,
    category: t.categoryName,
    categoryId: t.categoryId?.toString(),
    accountId: t.accountId.toString(),
    toAccountId: t.toAccountId?.toString(),
    date: t.date,
    isDeleted: t.isDeleted,
  }));

  const income = calculateIncome(formattedTxs);
  const expenses = calculateExpenses(formattedTxs);
  const netSavings = calculateNetSavings(income, expenses);
  const savingsRate = calculateSavingsRate(income, expenses);

  // Total current balance across all accounts
  const accounts = await Account.find({ ownerId }).lean();
  const totalBalance = accounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);

  return {
    income,
    expenses,
    netSavings,
    savingsRate,
    totalBalance: Math.round(totalBalance * 100) / 100,
    period,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    transactionCount: rawTxs.length,
  };
}
