import { connectToDatabase } from "@/lib/mongodb";
import { Account, IAccount, Transaction } from "@/models";
import { calculateAccountBalance } from "@/lib/finance-calculations";

export async function listAccounts(ownerId: string): Promise<IAccount[]> {
  await connectToDatabase();
  return Account.find({ ownerId }).sort({ isDefault: -1, createdAt: 1 }).lean() as unknown as IAccount[];
}

export async function getAccountById(ownerId: string, accountId: string): Promise<IAccount | null> {
  await connectToDatabase();
  return Account.findOne({ _id: accountId, ownerId }).lean() as unknown as IAccount | null;
}

export async function createAccount(
  ownerId: string,
  data: {
    name: string;
    type: "bank" | "cash" | "wallet" | "savings" | "investment" | "credit";
    balance: number;
    currency?: string;
    isDefault?: boolean;
    color?: string;
    notes?: string;
  }
) {
  await connectToDatabase();

  if (data.isDefault) {
    // Unset other default accounts for this user
    await Account.updateMany({ ownerId }, { isDefault: false });
  }

  const account = await Account.create({
    ...data,
    ownerId,
    currency: data.currency || "INR",
  });

  return account.toObject();
}

export async function updateAccount(
  ownerId: string,
  accountId: string,
  data: Partial<{
    name: string;
    type: "bank" | "cash" | "wallet" | "savings" | "investment" | "credit";
    balance: number;
    currency: string;
    isDefault: boolean;
    color: string;
    notes: string;
  }>
) {
  await connectToDatabase();

  if (data.isDefault) {
    await Account.updateMany({ ownerId, _id: { $ne: accountId } }, { isDefault: false });
  }

  const updated = await Account.findOneAndUpdate(
    { _id: accountId, ownerId },
    { $set: data },
    { new: true }
  ).lean();

  if (!updated) {
    throw new Error("Account not found or unauthorized");
  }

  return updated;
}

export async function deleteAccount(ownerId: string, accountId: string) {
  await connectToDatabase();

  // Check if transactions exist for this account
  const txCount = await Transaction.countDocuments({
    ownerId,
    $or: [{ accountId }, { toAccountId: accountId }],
    isDeleted: false,
  });

  if (txCount > 0) {
    throw new Error(`Cannot delete account with ${txCount} active transactions. Move or delete transactions first.`);
  }

  const deleted = await Account.findOneAndDelete({ _id: accountId, ownerId });
  if (!deleted) {
    throw new Error("Account not found or unauthorized");
  }

  return { success: true };
}

/**
 * Recalculates balance for an account by aggregating all transactions
 */
export async function syncAccountBalance(ownerId: string, accountId: string) {
  await connectToDatabase();
  const account = await Account.findOne({ _id: accountId, ownerId });
  if (!account) return;

  const transactions = await Transaction.find({
    ownerId,
    $or: [{ accountId }, { toAccountId: accountId }],
    isDeleted: false,
  }).lean();

  const formattedTxs = transactions.map((t) => ({
    amount: t.amount,
    type: t.type,
    accountId: t.accountId?.toString(),
    toAccountId: t.toAccountId?.toString(),
    date: t.date,
    isDeleted: t.isDeleted,
  }));

  // Calculate authoritative balance based on opening balance or initial baseline
  const updatedBalance = calculateAccountBalance(0, accountId, formattedTxs);
  await Account.updateOne({ _id: accountId, ownerId }, { balance: updatedBalance });
}
