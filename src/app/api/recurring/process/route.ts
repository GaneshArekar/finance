import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { processDueRecurringRules } from "@/server/data-access/recurring";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processDueRecurringRules(session.user.id);
    return NextResponse.json({
      success: true,
      processedCount: result.processedCount,
      transactions: result.transactions,
      message: `Successfully processed ${result.processedCount} due recurring transactions.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process recurring transactions" }, { status: 500 });
  }
}
