import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { toggleRecurringRule, deleteRecurringRule } from "@/server/data-access/recurring";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updated = await toggleRecurringRule(session.user.id, id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to toggle rule" }, { status: 400 });
  }
}

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
    await deleteRecurringRule(session.user.id, id);
    return NextResponse.json({ success: true, message: "Rule deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete rule" }, { status: 400 });
  }
}
