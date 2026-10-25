import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getFinancialSummary } from "@/server/data-access/transactions";
import { getDetailedReport } from "@/server/data-access/reports";
import { listBudgetsWithUtilization } from "@/server/data-access/budgets";
import { listAccounts } from "@/server/data-access/accounts";
import { ensureUserOnboarded } from "@/server/data-access/onboarding";
import { PeriodFilter } from "@/lib/finance-calculations";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as PeriodFilter) || "this_month";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Ensure user has default categories and accounts
    await ensureUserOnboarded(session.user.id);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const [summary, report, budgets, accounts] = await Promise.all([
      getFinancialSummary(session.user.id, period, startDate, endDate),
      getDetailedReport(session.user.id, period, startDate, endDate),
      listBudgetsWithUtilization(session.user.id, currentMonth),
      listAccounts(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        report,
        budgets,
        accounts,
      },
    });
  } catch (error: any) {
    console.error("Summary error:", error);
    return NextResponse.json({ error: error.message || "Failed to load summary" }, { status: 500 });
  }
}
