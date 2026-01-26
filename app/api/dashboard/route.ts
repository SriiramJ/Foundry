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

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentWeek, previousWeek] = await Promise.all([
      Promise.all([
        prisma.problem.count({ 
          where: { 
            createdById: session.user.id,
            createdAt: { gte: lastWeek }
          }
        }),
        prisma.solution.count({ 
          where: { 
            authorId: session.user.id,
            createdAt: { gte: lastWeek }
          }
        }),
        prisma.vote.count({
          where: {
            type: "UP",
            solution: { authorId: session.user.id },
            createdAt: { gte: lastWeek }
          }
        })
      ]),
      Promise.all([
        prisma.problem.count({ 
          where: { 
            createdById: session.user.id,
            createdAt: { gte: twoWeeksAgo, lt: lastWeek }
          }
        }),
        prisma.solution.count({ 
          where: { 
            authorId: session.user.id,
            createdAt: { gte: twoWeeksAgo, lt: lastWeek }
          }
        }),
        prisma.vote.count({
          where: {
            type: "UP",
            solution: { authorId: session.user.id },
            createdAt: { gte: twoWeeksAgo, lt: lastWeek }
          }
        })
      ])
    ]);

    const [totalProblems, totalSolutions, user] = await Promise.all([
      prisma.problem.count({ where: { createdById: session.user.id } }),
      prisma.solution.count({ where: { authorId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          reputation: true, 
          isPremium: true, 
          role: true,
          mentorApplication: true 
        }
      })
    ]);

    const totalUpvotes = await prisma.vote.count({
      where: {
        type: "UP",
        solution: { authorId: session.user.id }
      }
    });

    return NextResponse.json({
      problemsPosted: totalProblems,
      solutionsReceived: totalSolutions,
      reputation: user?.reputation || 0,
      isPremium: user?.isPremium || false,
      role: user?.role || 'EXPLORER',
      mentorApplication: user?.mentorApplication || null,
      upvotesReceived: totalUpvotes,
      weeklyChanges: {
        problems: currentWeek[0] - previousWeek[0],
        solutions: currentWeek[1] - previousWeek[1],
        reputation: currentWeek[2] - previousWeek[2]
      }
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}