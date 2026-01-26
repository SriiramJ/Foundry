import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = requestSchema.parse(body);

    // Verify email belongs to current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    });

    if (!user || user.email !== email) {
      return NextResponse.json({ error: "Email does not match account" }, { status: 400 });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: session.user.id,
        expiresAt,
      }
    });

    // Send email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }
}