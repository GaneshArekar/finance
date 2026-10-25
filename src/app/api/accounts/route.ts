import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { listAccounts, createAccount } from "@/server/data-access/accounts";
import { accountSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await listAccounts(session.user.id);
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to list accounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = accountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const account = await createAccount(session.user.id, parsed.data);
    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 400 });
  }
}
