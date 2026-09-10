import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isSubscriptionExempt } from "@/lib/subscription";
import AdminSubscriptionManager from "./AdminSubscriptionManager";

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  const admin = session?.user as { id?: string; role?: string } | undefined;

  if (!admin?.id) {
    redirect("/signin");
  }

  if (!isSubscriptionExempt(admin.role)) {
    redirect("/");
  }

  const now = new Date();

  // Keep the list accurate even when a user has not visited since expiration.
  await prisma.subscription.updateMany({
    where: {
      isActive: true,
      endDate: { lte: now },
    },
    data: { isActive: false },
  });

  const pendingAccounts = await prisma.user.findMany({
    where: {
      role: "USER",
      subscription: { is: { isActive: false } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return (
    <AdminSubscriptionManager
      pendingAccounts={pendingAccounts.map((account) => ({
        ...account,
        createdAt: account.createdAt.toISOString(),
      }))}
    />
  );
}
