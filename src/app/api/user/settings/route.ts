import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase, clientPromise, MONGODB_DB } from "@/lib/mongodb";
import { Transaction, Account, Category, Budget, SavingsGoal, GoalContribution, RecurringRule, AiInsight } from "@/models";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        currency: (session.user as any).currency || "INR",
        createdAt: session.user.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to get user settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, currency } = body;

    const client = await clientPromise;
    const db = client.db(MONGODB_DB);

    const updateFields: Record<string, string> = {};
    if (name) updateFields.name = name;
    if (currency) updateFields.currency = currency;

    await db.collection("user").updateOne(
      { id: session.user.id },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 400 });
  }
}

// Data Wipe / Account Reset workflow
export async function DELETE() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const ownerId = session.user.id;

    // Delete all financial records for the user
    await Promise.all([
      Transaction.deleteMany({ ownerId }),
      Budget.deleteMany({ ownerId }),
      SavingsGoal.deleteMany({ ownerId }),
      GoalContribution.deleteMany({ ownerId }),
      RecurringRule.deleteMany({ ownerId }),
      AiInsight.deleteMany({ ownerId }),
    ]);

    // Reset account balances to 0
    await Account.updateMany({ ownerId }, { $set: { balance: 0 } });

    return NextResponse.json({ success: true, message: "All financial data has been safely cleared" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to wipe data" }, { status: 500 });
  }
}
