import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { listSavingsGoals, createSavingsGoal } from "@/server/data-access/savings";
import { savingsGoalSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const goals = await listSavingsGoals(session.user.id);
    return NextResponse.json({ success: true, goals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = savingsGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const goal = await createSavingsGoal(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create goal" }, { status: 400 });
  }
}
