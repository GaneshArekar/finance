import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { SavingsGoal, GoalContribution, ISavingsGoal } from "@/models";
import { round2 } from "@/lib/finance-calculations";

export async function listSavingsGoals(ownerId: string) {
  await connectToDatabase();

  const goals = await SavingsGoal.find({ ownerId }).sort({ createdAt: -1 }).lean();

  const enriched = goals.map((g) => {
    const progress = g.targetAmount > 0 ? round2((g.currentAmount / g.targetAmount) * 100) : 0;
    const remaining = Math.max(0, round2(g.targetAmount - g.currentAmount));
    return {
      ...g,
      _id: g._id.toString(),
      progress: Math.min(100, progress),
      remaining,
    };
  });

  return enriched;
}

export async function createSavingsGoal(
  ownerId: string,
  data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline?: string | null;
    category?: string;
    color?: string;
    notes?: string;
  }
) {
  await connectToDatabase();

  const currentAmt = data.currentAmount || 0;
  const status = currentAmt >= data.targetAmount ? "completed" : "in_progress";

  const goal = await SavingsGoal.create({
    ownerId,
    name: data.name.trim(),
    targetAmount: data.targetAmount,
    currentAmount: currentAmt,
    deadline: data.deadline ? new Date(data.deadline) : undefined,
    category: data.category || "General",
    color: data.color || "#10b981",
    status,
    notes: data.notes || "",
  });

  if (currentAmt > 0) {
    await GoalContribution.create({
      ownerId,
      goalId: goal._id,
      amount: currentAmt,
      date: new Date(),
      note: "Initial deposit",
    });
  }

  return goal.toObject();
}

export async function addGoalContribution(
  ownerId: string,
  data: {
    goalId: string;
    amount: number;
    date?: string | Date;
    note?: string;
  }
) {
  await connectToDatabase();

  const goal = await SavingsGoal.findOne({ _id: data.goalId, ownerId });
  if (!goal) {
    throw new Error("Savings goal not found or unauthorized");
  }

  const contribution = await GoalContribution.create({
    ownerId,
    goalId: new mongoose.Types.ObjectId(data.goalId),
    amount: data.amount,
    date: data.date ? new Date(data.date) : new Date(),
    note: data.note || "",
  });

  const updatedCurrentAmount = round2(goal.currentAmount + data.amount);
  const isCompleted = updatedCurrentAmount >= goal.targetAmount;

  goal.currentAmount = updatedCurrentAmount;
  if (isCompleted && goal.status === "in_progress") {
    goal.status = "completed";
  }
  await goal.save();

  return {
    contribution: contribution.toObject(),
    goal: goal.toObject(),
  };
}

export async function getGoalContributions(ownerId: string, goalId: string) {
  await connectToDatabase();
  return GoalContribution.find({ ownerId, goalId }).sort({ date: -1 }).lean();
}

export async function deleteSavingsGoal(ownerId: string, goalId: string) {
  await connectToDatabase();
  const deleted = await SavingsGoal.findOneAndDelete({ _id: goalId, ownerId });
  if (!deleted) {
    throw new Error("Savings goal not found or unauthorized");
  }
  await GoalContribution.deleteMany({ ownerId, goalId });
  return { success: true };
}
