import { connectToDatabase } from "@/lib/mongodb";
import { Account, Category } from "@/models";

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Housing & Rent", type: "expense", icon: "home", color: "#6366f1" },
  { name: "Groceries", type: "expense", icon: "shopping-cart", color: "#10b981" },
  { name: "Food & Dining", type: "expense", icon: "utensils", color: "#f59e0b" },
  { name: "Transportation", type: "expense", icon: "car", color: "#3b82f6" },
  { name: "Utilities & Bills", type: "expense", icon: "zap", color: "#ec4899" },
  { name: "Entertainment", type: "expense", icon: "film", color: "#8b5cf6" },
  { name: "Health & Fitness", type: "expense", icon: "heart-pulse", color: "#ef4444" },
  { name: "Shopping", type: "expense", icon: "shopping-bag", color: "#14b8a6" },
  { name: "Subscriptions", type: "expense", icon: "credit-card", color: "#f97316" },
  { name: "Education", type: "expense", icon: "graduation-cap", color: "#06b6d4" },
  { name: "Miscellaneous", type: "expense", icon: "more-horizontal", color: "#64748b" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", type: "income", icon: "briefcase", color: "#10b981" },
  { name: "Freelance", type: "income", icon: "laptop", color: "#06b6d4" },
  { name: "Investments", type: "income", icon: "trending-up", color: "#8b5cf6" },
  { name: "Business", type: "income", icon: "building", color: "#3b82f6" },
  { name: "Gifts & Rewards", type: "income", icon: "gift", color: "#ec4899" },
  { name: "Other Income", type: "income", icon: "coins", color: "#f59e0b" },
];

export const DEFAULT_ACCOUNTS = [
  { name: "Primary Bank Account", type: "bank", balance: 0, isDefault: true, color: "#3b82f6" },
  { name: "Cash Wallet", type: "cash", balance: 0, isDefault: false, color: "#10b981" },
  { name: "Emergency Savings", type: "savings", balance: 0, isDefault: false, color: "#8b5cf6" },
];

export async function ensureUserOnboarded(ownerId: string) {
  await connectToDatabase();

  // Check accounts
  const accountCount = await Account.countDocuments({ ownerId });
  if (accountCount === 0) {
    await Account.insertMany(
      DEFAULT_ACCOUNTS.map((acc) => ({
        ...acc,
        ownerId,
      }))
    );
  }

  // Check categories
  const categoryCount = await Category.countDocuments({ ownerId });
  if (categoryCount === 0) {
    const defaultCategories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];
    await Category.insertMany(
      defaultCategories.map((cat) => ({
        ...cat,
        ownerId,
        isDefault: true,
      }))
    );
  }
}
