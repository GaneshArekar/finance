import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { RecurringRule, Transaction, Account, Category, IRecurringRule } from "@/models";
import { createTransaction } from "./transactions";

export function computeNextOccurrence(current: Date, frequency: "daily" | "weekly" | "monthly" | "yearly"): Date {
  const next = new Date(current);
  if (frequency === "daily") {
    next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else if (frequency === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export async function listRecurringRules(ownerId: string): Promise<IRecurringRule[]> {
  await connectToDatabase();
  return RecurringRule.find({ ownerId }).sort({ nextOccurrence: 1 }).lean() as unknown as IRecurringRule[];
}

export async function createRecurringRule(
  ownerId: string,
  data: {
    type: "income" | "expense";
    amount: number;
    categoryId?: string;
    accountId: string;
    description: string;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    startDate: string | Date;
    endDate?: string | null;
  }
) {
  await connectToDatabase();

  const account = await Account.findOne({ _id: data.accountId, ownerId });
  if (!account) throw new Error("Account not found");

  let catName = "General";
  if (data.categoryId) {
    const cat = await Category.findOne({ _id: data.categoryId, ownerId });
    if (cat) catName = cat.name;
  }

  const start = new Date(data.startDate);

  const rule = await RecurringRule.create({
    ownerId,
    type: data.type,
    amount: data.amount,
    categoryId: data.categoryId ? new mongoose.Types.ObjectId(data.categoryId) : undefined,
    categoryName: catName,
    accountId: new mongoose.Types.ObjectId(data.accountId),
    accountName: account.name,
    description: data.description.trim(),
    frequency: data.frequency,
    startDate: start,
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    nextOccurrence: start,
    isActive: true,
  });

  return rule.toObject();
}

export async function toggleRecurringRule(ownerId: string, ruleId: string) {
  await connectToDatabase();
  const rule = await RecurringRule.findOne({ _id: ruleId, ownerId });
  if (!rule) throw new Error("Rule not found or unauthorized");

  rule.isActive = !rule.isActive;
  await rule.save();
  return rule.toObject();
}

export async function deleteRecurringRule(ownerId: string, ruleId: string) {
  await connectToDatabase();
  const deleted = await RecurringRule.findOneAndDelete({ _id: ruleId, ownerId });
  if (!deleted) throw new Error("Rule not found or unauthorized");
  return { success: true };
}

/**
 * Idempotent execution of due recurring rules
 * Scans for active rules where nextOccurrence <= now
 */
export async function processDueRecurringRules(ownerId: string, asOfDate: Date = new Date()) {
  await connectToDatabase();

  const dueRules = await RecurringRule.find({
    ownerId,
    isActive: true,
    nextOccurrence: { $lte: asOfDate },
  });

  const executedTransactions = [];

  for (const rule of dueRules) {
    // Check if an occurrence transaction was already created for this exact date to guarantee idempotency
    const startOfDay = new Date(rule.nextOccurrence);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(rule.nextOccurrence);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTx = await Transaction.findOne({
      ownerId,
      recurringRuleId: rule._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
    });

    if (!existingTx) {
      // Create transaction for this occurrence
      const tx = await createTransaction(ownerId, {
        amount: rule.amount,
        type: rule.type,
        categoryId: rule.categoryId?.toString(),
        categoryName: rule.categoryName,
        accountId: rule.accountId.toString(),
        date: rule.nextOccurrence,
        description: `[Recurring] ${rule.description}`,
        paymentMethod: "bank_transfer",
        notes: `Automatically processed from recurring schedule (${rule.frequency})`,
      });

      // Link rule id to created transaction
      await Transaction.updateOne({ _id: tx._id }, { recurringRuleId: rule._id });
      executedTransactions.push(tx);
    }

    // Advance next occurrence
    const nextDate = computeNextOccurrence(rule.nextOccurrence, rule.frequency);
    rule.lastProcessed = asOfDate;

    if (rule.endDate && nextDate > rule.endDate) {
      rule.isActive = false;
    } else {
      rule.nextOccurrence = nextDate;
    }

    await rule.save();
  }

  return {
    processedCount: executedTransactions.length,
    transactions: executedTransactions,
  };
}
