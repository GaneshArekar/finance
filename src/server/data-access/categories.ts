import { connectToDatabase } from "@/lib/mongodb";
import { Category, ICategory, Transaction } from "@/models";

export async function listCategories(ownerId: string, type?: "income" | "expense"): Promise<ICategory[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = { ownerId };
  if (type) {
    query.type = type;
  }
  return Category.find(query).sort({ name: 1 }).lean() as unknown as ICategory[];
}

export async function createCategory(
  ownerId: string,
  data: {
    name: string;
    type: "income" | "expense";
    icon?: string;
    color?: string;
  }
) {
  await connectToDatabase();
  const existing = await Category.findOne({
    ownerId,
    type: data.type,
    name: { $regex: new RegExp(`^${data.name.trim()}$`, "i") },
  });

  if (existing) {
    throw new Error(`Category "${data.name}" already exists for ${data.type}`);
  }

  const category = await Category.create({
    ...data,
    ownerId,
    isDefault: false,
  });

  return category.toObject();
}

export async function deleteCategory(ownerId: string, categoryId: string) {
  await connectToDatabase();

  const inUse = await Transaction.countDocuments({
    ownerId,
    categoryId,
    isDeleted: false,
  });

  if (inUse > 0) {
    throw new Error(`Cannot delete category in use by ${inUse} transactions.`);
  }

  const deleted = await Category.findOneAndDelete({ _id: categoryId, ownerId });
  if (!deleted) {
    throw new Error("Category not found or unauthorized");
  }

  return { success: true };
}
