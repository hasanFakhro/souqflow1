import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  activateSubscriptionForEmail,
  isSubscriptionExempt,
} from "@/lib/subscription";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmail(input: unknown) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return "";
  }

  const email = (input as { email?: unknown }).email;
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string } | undefined;

  if (!admin?.id || !isSubscriptionExempt(admin.role)) {
    return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = getEmail(body);

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid account email address." }, { status: 400 });
  }

  let subscription: Awaited<ReturnType<typeof activateSubscriptionForEmail>>;

  try {
    subscription = await activateSubscriptionForEmail(email);
  } catch (error) {
    console.error("Unable to activate manual subscription", error);
    return NextResponse.json(
      { error: "Unable to activate this subscription. Please try again." },
      { status: 500 }
    );
  }

  if (!subscription) {
    return NextResponse.json(
      { error: "No paid user account was found for that email address." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    email: subscription.email,
    isActive: true,
    expiresAt: subscription.expiresAt.toISOString(),
  });
}
