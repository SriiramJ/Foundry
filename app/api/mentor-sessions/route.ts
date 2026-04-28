import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bookSchema = z.object({
  mentorId: z.string(),
  topic: z.string().min(5),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(30).max(120).default(60),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [asMentor, asLearner] = await Promise.all([
      prisma.mentorSession.findMany({
        where: { mentorId: userId },
        include: {
          learner: { select: { id: true, name: true, email: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.mentorSession.findMany({
        where: { learnerId: userId },
        include: {
          mentor: { select: { id: true, name: true, reputation: true } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
    ]);

    return NextResponse.json({ asMentor, asLearner });
  } catch (error) {
    console.error("Mentor sessions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Pro plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, role: true, subscription: { select: { plan: true, status: true, endDate: true } } },
    });

    const isPro =
      user?.subscription?.plan === "PRO" &&
      user?.subscription?.status === "active" &&
      (!user.subscription.endDate || user.subscription.endDate > new Date());

    const isMentor = user?.role === "MENTOR";

    if (!isPro && !isMentor) {
      return NextResponse.json(
        { error: "Pro plan required to book mentor sessions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = bookSchema.parse(body);

    // Verify mentor exists
    const mentor = await prisma.user.findUnique({
      where: { id: data.mentorId, role: "MENTOR" },
      select: { id: true, name: true },
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    if (data.mentorId === session.user.id) {
      return NextResponse.json({ error: "You cannot book a session with yourself" }, { status: 400 });
    }

    // Check for scheduling conflict (same mentor, overlapping time ±duration)
    const scheduledAt = new Date(data.scheduledAt);
    const bufferMs = data.duration * 60 * 1000;
    const conflict = await prisma.mentorSession.findFirst({
      where: {
        mentorId: data.mentorId,
        status: { in: ["PENDING", "CONFIRMED"] },
        scheduledAt: {
          gte: new Date(scheduledAt.getTime() - bufferMs),
          lte: new Date(scheduledAt.getTime() + bufferMs),
        },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Mentor is not available at that time. Please choose a different slot." },
        { status: 409 }
      );
    }

    const mentorSession = await prisma.mentorSession.create({
      data: {
        topic: data.topic,
        description: data.description,
        scheduledAt,
        duration: data.duration,
        mentorId: data.mentorId,
        learnerId: session.user.id,
      },
      include: {
        mentor: { select: { id: true, name: true } },
        learner: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(mentorSession);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error("Book session error:", error);
    return NextResponse.json({ error: "Failed to book session" }, { status: 500 });
  }
}
