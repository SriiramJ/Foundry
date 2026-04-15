import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSecret, generateKeyUri } from "@/lib/totp";
import QRCode from "qrcode";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = generateSecret();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret }
    });

    const otpAuthUrl = generateKeyUri(session.user.email!, secret, "Foundry");
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    return NextResponse.json({ secret, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}
