import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment.entity;
        const userId = payment.notes?.userId;
        const planId = payment.notes?.planId;

        if (!userId || !planId) break;

        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: planId.toUpperCase() as any,
              status: "active",
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id,
              startDate: new Date(),
            },
            update: {
              plan: planId.toUpperCase() as any,
              status: "active",
              razorpayPaymentId: payment.id,
              razorpayOrderId: payment.order_id,
              startDate: new Date(),
              endDate: null,
            },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: true },
          }),
        ]);
        break;
      }

      case "payment.failed": {
        const payment = payload.payment.entity;
        const userId = payment.notes?.userId;
        if (!userId) break;

        await prisma.subscription.updateMany({
          where: { userId },
          data: { status: "failed" },
        });
        break;
      }

      case "subscription.cancelled": {
        const subscription = payload.subscription.entity;
        const userId = subscription.notes?.userId;
        if (!userId) break;

        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { userId },
            data: { status: "cancelled", plan: "FREE" as any, endDate: new Date() },
          }),
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: false },
          }),
        ]);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
