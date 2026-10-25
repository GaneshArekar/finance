import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateTransactionsCsv } from "@/server/data-access/reports";
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

    const csvData = await generateTransactionsCsv(session.user.id, period, startDate, endDate);

    const filename = `finance_transactions_${period}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate CSV export" }, { status: 500 });
  }
}
