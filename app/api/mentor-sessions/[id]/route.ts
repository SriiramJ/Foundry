import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, meetLink, notes } = await request.json();

    // Validate meetLink if provided
    if (meetLink !== undefined && meetLink !== null && meetLink !== "") {
      try { new URL(meetLink); } catch {
        return NextResponse.json({ error: "Invalid meeting link URL" }, { status: 400 });
      }
    }

    // Require meetLink when confirming
    if (status === "CONFIRMED" && !meetLink?.trim()) {
      return NextResponse.json({ error: "A meeting link is required to confirm the session" }, { status: 400 });
    }

    const mentorSession = await prisma.mentorSession.findUnique({ where: { id } });
    if (!mentorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isMentor = mentorSession.mentorId === session.user.id;
    const isLearner = mentorSession.learnerId === session.user.id;

    if (!isMentor && !isLearner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only mentor can confirm/complete; either party can cancel
    if (status === "CONFIRMED" || status === "COMPLETED") {
      if (!isMentor) {
        return NextResponse.json({ error: "Only the mentor can confirm or complete sessions" }, { status: 403 });
      }
    }

    const updated = await prisma.mentorSession.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(meetLink !== undefined && { meetLink }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        mentor: { select: { id: true, name: true } },
        learner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const mentorSession = await prisma.mentorSession.findUnique({ where: { id } });

    if (!mentorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (
      mentorSession.mentorId !== session.user.id &&
      mentorSession.learnerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.mentorSession.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session delete error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
