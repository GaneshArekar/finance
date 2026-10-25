import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecurringRule extends Document {
  ownerId: string;
  type: "income" | "expense";
  amount: number;
  categoryId?: mongoose.Types.ObjectId;
  categoryName?: string;
  accountId: mongoose.Types.ObjectId;
  accountName?: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: Date;
  endDate?: Date;
  nextOccurrence: Date;
  lastProcessed?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringRuleSchema = new Schema<IRecurringRule>(
  {
    ownerId: { type: String, required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be positive"] },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    categoryName: { type: String, default: "General" },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    accountName: { type: String, default: "" },
    description: { type: String, required: true, trim: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextOccurrence: { type: Date, required: true },
    lastProcessed: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecurringRuleSchema.index({ ownerId: 1, isActive: 1, nextOccurrence: 1 });

export const RecurringRule: Model<IRecurringRule> =
  mongoose.models.RecurringRule ||
  mongoose.model<IRecurringRule>("RecurringRule", RecurringRuleSchema);
