import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/totp";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { otp } = await request.json();
    if (!otp) return NextResponse.json({ error: "OTP is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true }
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up. Please generate a QR code first." }, { status: 400 });
    }

    const isValid = verifyToken(otp, user.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP code. Please try again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true }
    });

    return NextResponse.json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json({ error: "Failed to enable 2FA" }, { status: 500 });
  }
}
