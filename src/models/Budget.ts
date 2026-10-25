import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBudget extends Document {
  ownerId: string;
  categoryId?: mongoose.Types.ObjectId; // null or undefined represents overall budget
  categoryName: string;
  month: string; // Format "YYYY-MM"
  amount: number;
  warningThreshold: number; // default 80%
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    ownerId: { type: String, required: true, index: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    categoryName: { type: String, required: true, default: "Overall Monthly" },
    month: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: [1, "Budget amount must be positive"] },
    warningThreshold: { type: Number, default: 80, min: 10, max: 100 },
  },
  { timestamps: true }
);

// Prevent duplicate budgets for the same category in the same month
BudgetSchema.index({ ownerId: 1, month: 1, categoryId: 1 }, { unique: true });

export const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
