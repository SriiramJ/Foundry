import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { sendMentorApplicationStatusEmail } from "@/lib/email";

function isAdmin(token: any) {
  return token?.role === "ADMIN" || token?.sub === "admin";
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!isAdmin(token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const applications = await prisma.mentorApplication.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!isAdmin(token)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, status, reviewNotes } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["PENDING", "APPROVED", "REJECTED", "NEEDS_INFO"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const application = await prisma.mentorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updatedApplication = await prisma.mentorApplication.update({
      where: { id: applicationId },
      data: { status, reviewNotes: reviewNotes || null, updatedAt: new Date() },
    });

    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "MENTOR" },
      });
    }

    if (status !== "PENDING") {
      sendMentorApplicationStatusEmail(
        application.user.email!,
        application.user.name || "there",
        status as "APPROVED" | "REJECTED" | "NEEDS_INFO",
        reviewNotes
      ).catch((err) => console.error("Mentor status email error:", err));
    }

    return NextResponse.json({ message: "Application updated successfully", application: updatedApplication });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
