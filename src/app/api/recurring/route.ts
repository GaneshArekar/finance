import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { listRecurringRules, createRecurringRule } from "@/server/data-access/recurring";
import { recurringRuleSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rules = await listRecurringRules(session.user.id);
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list recurring rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = recurringRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const rule = await createRecurringRule(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: rule }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create recurring rule" }, { status: 400 });
  }
}
