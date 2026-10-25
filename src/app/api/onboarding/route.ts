import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { ensureUserOnboarded } from "@/server/data-access/onboarding";

export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserOnboarded(session.user.id);
    return NextResponse.json({ success: true, message: "Onboarding verified" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to onboard user" }, { status: 500 });
  }
}
