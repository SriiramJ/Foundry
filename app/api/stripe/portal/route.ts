import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
