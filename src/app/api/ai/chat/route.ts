import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { askFinancialCoach } from "@/server/data-access/ai";
import { z } from "zod";

const chatSchema = z.object({
  question: z.string().min(1, "Question cannot be empty").max(500),
  month: z.string().regex(/^\d{4}-\d{2}$/).default(() => new Date().toISOString().slice(0, 7)),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })).optional().default([]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.flatten() }, { status: 400 });
    }

    const answer = await askFinancialCoach(
      session.user.id,
      parsed.data.question,
      parsed.data.month,
      parsed.data.history
    );

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process question" }, { status: 500 });
  }
}
