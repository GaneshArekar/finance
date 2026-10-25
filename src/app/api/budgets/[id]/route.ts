import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { deleteBudget } from "@/server/data-access/budgets";

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
    await deleteBudget(session.user.id, id);
    return NextResponse.json({ success: true, message: "Budget deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete budget" }, { status: 400 });
  }
}
