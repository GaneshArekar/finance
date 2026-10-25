import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { listBudgetsWithUtilization, upsertBudget } from "@/server/data-access/budgets";
import { budgetSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);

    const data = await listBudgetsWithUtilization(session.user.id, month);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list budgets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const budget = await upsertBudget(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save budget" }, { status: 400 });
  }
}
