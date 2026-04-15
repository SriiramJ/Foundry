import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMentorApplicationStatusEmail } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, any user can view applications (in production, add admin check)
    const applications = await prisma.mentorApplication.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Get applications error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, status, reviewNotes } = body;

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_INFO'].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const application = await prisma.mentorApplication.findUnique({
      where: { id: applicationId },
      include: { user: true }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update application
    const updatedApplication = await prisma.mentorApplication.update({
      where: { id: applicationId },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        updatedAt: new Date()
      }
    });

    // If approved, update user role to MENTOR
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: "MENTOR" }
      });
    }

    if (status !== "PENDING") {
      sendMentorApplicationStatusEmail(
        application.user.email!,
        application.user.name || 'there',
        status as 'APPROVED' | 'REJECTED' | 'NEEDS_INFO',
        reviewNotes
      ).catch(err => console.error('Mentor status email error:', err));
    }

    return NextResponse.json({ 
      message: "Application updated successfully", 
      application: updatedApplication 
    });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}