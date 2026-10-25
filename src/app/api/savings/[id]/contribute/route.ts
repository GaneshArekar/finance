import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { addGoalContribution } from "@/server/data-access/savings";
import { goalContributionSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = goalContributionSchema.safeParse({ ...body, goalId: id });

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const result = await addGoalContribution(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to record contribution" }, { status: 400 });
  }
}
