import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) break;

        const stripeSubscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: planId.toUpperCase() as any,
              status: "active",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: stripeSubscription.id,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              startDate: new Date(),
            },
            update: {
              plan: planId.toUpperCase() as any,
              status: "active",
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: stripeSubscription.id,
              stripePriceId: stripeSubscription.items.data[0].price.id,
              startDate: new Date(),
              endDate: null,
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: true }
          })
        ]);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const isActive = sub.status === "active";
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: { status: sub.status }
          }),
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: isActive }
          })
        ]);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data: {
              status: "canceled",
              plan: "FREE" as any,
              endDate: new Date()
            }
          }),
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: false }
          })
        ]);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
        const subId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as any)?.id;
        if (!subId) break;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { status: "past_due" }
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
