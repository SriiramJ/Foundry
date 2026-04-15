import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMentorApplicationAdminEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, expertise, experience, background, proofOfWork } = body;

    if (!fullName || !expertise || !experience || !background || !proofOfWork) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (parseInt(experience) < 1) {
      return NextResponse.json({ error: "Experience must be at least 1 year" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mentorApplication: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "MENTOR") {
      return NextResponse.json({ error: "You are already a mentor" }, { status: 400 });
    }

    if (user.mentorApplication) {
      return NextResponse.json({ error: "Application already exists" }, { status: 400 });
    }

    const application = await prisma.mentorApplication.create({
      data: {
        fullName,
        expertise,
        experience: parseInt(experience),
        background,
        proofOfWork,
        userId: user.id
      }
    });

    sendNewMentorApplicationAdminEmail(fullName, user.email!, expertise).catch(err => console.error('Admin mentor application email error:', err));

    return NextResponse.json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Mentor application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mentorApplication: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ application: user.mentorApplication });
  } catch (error) {
    console.error("Get mentor application error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}