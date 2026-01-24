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

    const [recentSolutions, recentProblems, recentVotes] = await Promise.all([
      prisma.solution.findMany({
        where: { 
          problem: { createdById: session.user.id }
        },
        include: {
          problem: { select: { title: true } },
          author: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 3
      }),
      prisma.problem.findMany({
        where: { createdById: session.user.id },
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 3
      }),
      prisma.vote.findMany({
        where: {
          solution: { authorId: session.user.id },
          type: "UP"
        },
        include: {
          solution: {
            select: { 
              problem: { select: { title: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 2
      })
    ]);

    const activities = [
      ...recentSolutions.map(solution => ({
        type: "solution_received",
        title: "New solution received",
        description: solution.problem.title,
        time: solution.createdAt,
        status: "success"
      })),
      ...recentProblems.map(problem => ({
        type: "problem_posted",
        title: "Problem posted",
        description: problem.title,
        time: problem.createdAt,
        status: "default"
      })),
      ...recentVotes.map(vote => ({
        type: "reputation_increased",
        title: "Reputation increased",
        description: `+5 points for helpful solution`,
        time: vote.createdAt,
        status: "warning"
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}