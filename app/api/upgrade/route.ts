import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendUpgradeConfirmationEmail, sendSubscriptionExpiryReminderEmail } from "@/lib/email";

const upgradeSchema = z.object({
  planId: z.enum(["free", "premium", "pro"]),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = upgradeSchema.parse(body);

    // In a real app, this would integrate with Stripe/payment processor
    const isPremium = planId !== "free";
    const subscriptionTier = planId.toUpperCase() as "FREE" | "PREMIUM" | "PRO";
    const endDate = isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined; // 30 days

    const [updatedUser] = await Promise.all([
      prisma.user.update({
        where: { id: session.user.id },
        data: { isPremium },
        include: { subscription: true }
      }),
      prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: { plan: subscriptionTier, status: isPremium ? 'active' : 'cancelled', startDate: new Date(), endDate: endDate ?? null },
        create: { userId: session.user.id, plan: subscriptionTier, status: isPremium ? 'active' : 'cancelled', endDate: endDate ?? null },
      })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true }
    });

    if (isPremium && user?.email) {
      sendUpgradeConfirmationEmail(user.email, user.name || 'there', subscriptionTier, endDate)
        .catch(err => console.error('Upgrade email error:', err));

      // Schedule expiry reminder 3 days before end date
      if (endDate) {
        const reminderDelay = endDate.getTime() - Date.now() - 3 * 24 * 60 * 60 * 1000;
        if (reminderDelay > 0) {
          setTimeout(() => {
            sendSubscriptionExpiryReminderEmail(user.email!, user.name || 'there', subscriptionTier, endDate)
              .catch(err => console.error('Expiry reminder email error:', err));
          }, reminderDelay);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${planId} plan`,
      user: {
        id: updatedUser.id,
        isPremium: updatedUser.isPremium,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid plan selection", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process upgrade" }, { status: 500 });
  }
}