import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoalContribution extends Document {
  ownerId: string;
  goalId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalContributionSchema = new Schema<IGoalContribution>(
  {
    ownerId: { type: String, required: true, index: true },
    goalId: { type: Schema.Types.ObjectId, ref: "SavingsGoal", required: true, index: true },
    amount: { type: Number, required: true, min: [0.01, "Contribution amount must be positive"] },
    date: { type: Date, default: Date.now },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

GoalContributionSchema.index({ ownerId: 1, goalId: 1, date: -1 });

export const GoalContribution: Model<IGoalContribution> =
  mongoose.models.GoalContribution ||
  mongoose.model<IGoalContribution>("GoalContribution", GoalContributionSchema);
