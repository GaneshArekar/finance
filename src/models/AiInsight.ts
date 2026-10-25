import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAiInsight extends Document {
  ownerId: string;
  month: string; // "YYYY-MM"
  summary: string;
  highlights: string[];
  recommendations: string[];
  metricsSnapshot: {
    income: number;
    expenses: number;
    netSavings: number;
    savingsRate: number;
    topCategories: { category: string; amount: number; percentage: number }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const AiInsightSchema = new Schema<IAiInsight>(
  {
    ownerId: { type: String, required: true, index: true },
    month: { type: String, required: true },
    summary: { type: String, required: true },
    highlights: [{ type: String }],
    recommendations: [{ type: String }],
    metricsSnapshot: {
      income: { type: Number, default: 0 },
      expenses: { type: Number, default: 0 },
      netSavings: { type: Number, default: 0 },
      savingsRate: { type: Number, default: 0 },
      topCategories: [
        {
          category: String,
          amount: Number,
          percentage: Number,
        },
      ],
    },
  },
  { timestamps: true }
);

AiInsightSchema.index({ ownerId: 1, month: 1, createdAt: -1 });

export const AiInsight: Model<IAiInsight> =
  mongoose.models.AiInsight || mongoose.model<IAiInsight>("AiInsight", AiInsightSchema);
