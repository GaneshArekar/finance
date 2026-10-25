import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { generateMonthlyInsight } from "@/server/data-access/ai";

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const force = searchParams.get("force") === "true";

    const insight = await generateMonthlyInsight(session.user.id, month, force);
    return NextResponse.json({ success: true, insight });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate AI insight" }, { status: 500 });
  }
}
