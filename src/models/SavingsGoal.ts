import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISavingsGoal extends Document {
  ownerId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category?: string;
  color?: string;
  status: "in_progress" | "completed" | "paused";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: [1, "Target amount must be positive"] },
    currentAmount: { type: Number, default: 0, min: 0 },
    deadline: { type: Date },
    category: { type: String, default: "General" },
    color: { type: String, default: "#10b981" },
    status: {
      type: String,
      enum: ["in_progress", "completed", "paused"],
      default: "in_progress",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

SavingsGoalSchema.index({ ownerId: 1, status: 1 });

export const SavingsGoal: Model<ISavingsGoal> =
  mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema);
