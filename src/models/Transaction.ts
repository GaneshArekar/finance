import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  ownerId: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  categoryId?: mongoose.Types.ObjectId;
  categoryName?: string;
  accountId: mongoose.Types.ObjectId;
  accountName?: string;
  toAccountId?: mongoose.Types.ObjectId;
  toAccountName?: string;
  date: Date;
  description: string;
  paymentMethod?: "cash" | "upi" | "card" | "bank_transfer" | "other";
  tags?: string[];
  recurringRuleId?: mongoose.Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    ownerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than zero"] },
    type: { type: String, enum: ["income", "expense", "transfer"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    categoryName: { type: String, default: "General" },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    accountName: { type: String, default: "" },
    toAccountId: { type: Schema.Types.ObjectId, ref: "Account" },
    toAccountName: { type: String, default: "" },
    date: { type: Date, required: true, index: true },
    description: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "bank_transfer", "other"],
      default: "upi",
    },
    tags: [{ type: String, trim: true }],
    recurringRuleId: { type: Schema.Types.ObjectId, ref: "RecurringRule" },
    notes: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound indexes for optimal dashboard and report queries
TransactionSchema.index({ ownerId: 1, date: -1 });
TransactionSchema.index({ ownerId: 1, type: 1, date: -1 });
TransactionSchema.index({ ownerId: 1, accountId: 1, date: -1 });
TransactionSchema.index({ ownerId: 1, categoryId: 1, date: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
