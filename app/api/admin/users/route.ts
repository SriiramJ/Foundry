import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { sendUpgradeConfirmationEmail } from "@/lib/email";

function isAdmin(token: any) {
  return token?.role === "ADMIN" || token?.sub === "admin";
}

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!isAdmin(token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isPremium: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true, endDate: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/users — set plan for a user
export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!isAdmin(token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, plan } = await request.json();
    if (!userId || !plan || !["FREE", "PREMIUM", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "userId and plan (FREE | PREMIUM | PRO) are required" }, { status: 400 });
    }

    const isPremium = plan !== "FREE";
    const endDate = isPremium ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

    const [user] = await Promise.all([
      prisma.user.update({
        where: { id: userId },
        data: { isPremium },
        select: { name: true, email: true },
      }),
      prisma.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: isPremium ? "active" : "cancelled",
          startDate: new Date(),
          endDate,
        },
        create: {
          userId,
          plan,
          status: isPremium ? "active" : "cancelled",
          endDate,
        },
      }),
    ]);

    if (isPremium && user.email) {
      sendUpgradeConfirmationEmail(user.email, user.name || "there", plan, endDate!)
        .catch((err) => console.error("Admin upgrade email error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
