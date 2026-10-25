import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAccount extends Document {
  ownerId: string;
  name: string;
  type: "bank" | "cash" | "wallet" | "savings" | "investment" | "credit";
  balance: number;
  currency: string;
  isDefault: boolean;
  color?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["bank", "cash", "wallet", "savings", "investment", "credit"],
      default: "bank",
    },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "INR" },
    isDefault: { type: Boolean, default: false },
    color: { type: String, default: "#10b981" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

AccountSchema.index({ ownerId: 1, name: 1 }, { unique: true });

export const Account: Model<IAccount> =
  mongoose.models.Account || mongoose.model<IAccount>("Account", AccountSchema);
