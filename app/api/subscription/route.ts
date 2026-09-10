import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscriptionState, isSubscriptionExempt } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  const user = session?.user as { id?: string; role?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSubscriptionExempt(user.role)) {
    return NextResponse.json({ isActive: true, expiresAt: null });
  }

  const subscription = await getSubscriptionState(user.id);

  return NextResponse.json({
    isActive: subscription.isActive,
    expiresAt: subscription.expiresAt?.toISOString() ?? null,
  });
}
