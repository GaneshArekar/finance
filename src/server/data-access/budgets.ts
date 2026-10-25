import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Budget, Transaction, Category, IBudget } from "@/models";
import { getBudgetStatus, round2 } from "@/lib/finance-calculations";

export async function listBudgetsWithUtilization(ownerId: string, month: string) {
  await connectToDatabase();

  const [yearStr, monthStr] = month.split("-");
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const startDate = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

  // 1. Fetch all budgets for this month
  const budgets = await Budget.find({ ownerId, month }).lean();

  // 2. Fetch all expenses for this month
  const expenses = await Transaction.find({
    ownerId,
    type: "expense",
    isDeleted: false,
    date: { $gte: startDate, $lte: endDate },
  }).lean();

  // Compute overall total expenses
  const totalExpenseSum = expenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // Map categoryId -> total spent
  const categorySpentMap = new Map<string, number>();
  for (const exp of expenses) {
    if (exp.categoryId) {
      const catId = exp.categoryId.toString();
      categorySpentMap.set(catId, (categorySpentMap.get(catId) || 0) + exp.amount);
    }
  }

  const result = budgets.map((b) => {
    let spent = 0;
    if (!b.categoryId) {
      // Overall monthly budget
      spent = totalExpenseSum;
    } else {
      spent = categorySpentMap.get(b.categoryId.toString()) || 0;
    }

    const { status, utilization, remaining } = getBudgetStatus(
      spent,
      b.amount,
      b.warningThreshold || 80
    );

    return {
      _id: b._id.toString(),
      month: b.month,
      categoryId: b.categoryId ? b.categoryId.toString() : null,
      categoryName: b.categoryName,
      amount: b.amount,
      warningThreshold: b.warningThreshold || 80,
      spent: round2(spent),
      remaining,
      utilization,
      status,
    };
  });

  return {
    month,
    budgets: result,
    totalBudgeted: round2(budgets.reduce((acc, b) => acc + b.amount, 0)),
    totalSpent: round2(totalExpenseSum),
  };
}

export async function upsertBudget(
  ownerId: string,
  data: {
    month: string;
    categoryId?: string | null;
    categoryName?: string;
    amount: number;
    warningThreshold?: number;
  }
) {
  await connectToDatabase();

  let catName = data.categoryName || "Overall Monthly";
  let catObjectId: mongoose.Types.ObjectId | null = null;

  if (data.categoryId) {
    catObjectId = new mongoose.Types.ObjectId(data.categoryId);
    const cat = await Category.findOne({ _id: catObjectId, ownerId });
    if (cat) catName = cat.name;
  }

  const filter = {
    ownerId,
    month: data.month,
    categoryId: catObjectId,
  };

  const update = {
    $set: {
      categoryName: catName,
      amount: data.amount,
      warningThreshold: data.warningThreshold || 80,
    },
  };

  const budget = await Budget.findOneAndUpdate(filter, update, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();

  return budget;
}

export async function deleteBudget(ownerId: string, budgetId: string) {
  await connectToDatabase();
  const deleted = await Budget.findOneAndDelete({ _id: budgetId, ownerId });
  if (!deleted) {
    throw new Error("Budget not found or unauthorized");
  }
  return { success: true };
}
