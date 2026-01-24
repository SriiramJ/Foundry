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

    const [problemsCount, solutionsCount, user] = await Promise.all([
      prisma.problem.count({ where: { createdById: session.user.id } }),
      prisma.solution.count({ where: { authorId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { reputation: true, isPremium: true }
      })
    ]);

    const upvotesReceived = await prisma.vote.count({
      where: {
        type: "UP",
        solution: { authorId: session.user.id }
      }
    });

    return NextResponse.json({
      problemsPosted: problemsCount,
      solutionsReceived: solutionsCount * 2,
      reputation: user?.reputation || 0,
      isPremium: user?.isPremium || false,
      upvotesReceived
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}