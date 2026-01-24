import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    const subscriptionTier = planId.toUpperCase();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPremium,
        subscriptionTier,
        subscriptionUpdatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully upgraded to ${planId} plan` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process upgrade" }, { status: 500 });
  }
}