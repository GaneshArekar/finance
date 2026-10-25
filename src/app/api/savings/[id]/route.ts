import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteSavingsGoal } from "@/server/data-access/savings";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteSavingsGoal(session.user.id, id);
    return NextResponse.json({ success: true, message: "Goal deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete goal" }, { status: 400 });
  }
}
