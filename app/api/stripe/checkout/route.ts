import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    });

    let stripeCustomerId = subscription?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id }
      });
      stripeCustomerId = customer.id;
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/upgrade`,
      metadata: {
        userId: session.user.id,
        planId,
      },
      subscription_data: {
        metadata: { userId: session.user.id, planId }
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
