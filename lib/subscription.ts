import prisma from "@/lib/prisma";

export const MONTHLY_SUBSCRIPTION_PRICE = 9.99;
export const SUBSCRIPTION_CURRENCY = "USD";

export function isSubscriptionExempt(role?: string) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export type SubscriptionState = {
  isActive: boolean;
  expiresAt: Date | null;
};

export type SubscriptionActivation = {
  email: string;
  expiresAt: Date;
};

function isExpired(endDate: Date | null, now: Date) {
  return endDate !== null && endDate <= now;
}

export async function getSubscriptionState(userId: string): Promise<SubscriptionState> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { isActive: true, endDate: true },
  });

  if (!subscription || !subscription.isActive) {
    return { isActive: false, expiresAt: subscription?.endDate ?? null };
  }

  const now = new Date();

  if (isExpired(subscription.endDate, now)) {
    await prisma.subscription.updateMany({
      where: {
        userId,
        isActive: true,
        endDate: { lte: now },
      },
      data: { isActive: false },
    });

    return { isActive: false, expiresAt: subscription.endDate };
  }

  return { isActive: true, expiresAt: subscription.endDate };
}

export function addOneMonth(date: Date) {
  const nextMonth = new Date(date);
  const day = nextMonth.getUTCDate();

  nextMonth.setUTCDate(1);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  nextMonth.setUTCDate(
    Math.min(day, new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0)).getUTCDate())
  );

  return nextMonth;
}

/**
 * Grants one subscription month after an administrator confirms a Wish Money
 * payment. The email must be the one the payer added to the wallet note.
 */
export async function activateSubscriptionForEmail(
  email: string
): Promise<SubscriptionActivation | null> {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findUnique({
      where: { email },
      select: {
        email: true,
        id: true,
        role: true,
        subscription: {
          select: { endDate: true, isActive: true },
        },
      },
    });

    // Only paid USER accounts can be activated through the manual workflow.
    if (!user || user.role !== "USER") {
      return null;
    }

    const now = new Date();
    const startsAt =
      user.subscription?.isActive &&
      user.subscription.endDate &&
      user.subscription.endDate > now
        ? user.subscription.endDate
        : now;
    const expiresAt = addOneMonth(startsAt);

    await transaction.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        startDate: now,
        endDate: expiresAt,
        isActive: true,
      },
      update: {
        startDate: startsAt,
        endDate: expiresAt,
        isActive: true,
      },
    });

    return { email: user.email, expiresAt };
  });
}
