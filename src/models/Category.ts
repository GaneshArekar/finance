import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  ownerId: string; // or 'system' for global defaults
  name: string;
  type: "income" | "expense";
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    ownerId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, default: "tag" },
    color: { type: String, default: "#10b981" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ ownerId: 1, type: 1, name: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
