import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        problems: {
          include: { _count: { select: { solutions: true } } },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        solutions: {
          include: { 
            problem: { select: { title: true } },
            votes: true
          },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        mentorApplication: true,
        _count: {
          select: {
            problems: true,
            solutions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const upvotesReceived = user.solutions.reduce((total, solution) => 
      total + solution.votes.filter(v => v.type === "UP").length, 0
    );

    const verifiedSolutions = user.solutions.filter(s => s.isVerified).length;

    return NextResponse.json({
      ...user,
      upvotesReceived,
      verifiedSolutions
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}