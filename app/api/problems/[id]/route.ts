import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { name: true, role: true } },
        solutions: {
          include: {
            author: { select: { name: true, role: true, reputation: true } },
            votes: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // Calculate vote counts for each solution
    const problemWithVotes = {
      ...problem,
      solutions: problem.solutions.map(solution => ({
        ...solution,
        upvotes: solution.votes.filter(v => v.type === "UP").length,
        downvotes: solution.votes.filter(v => v.type === "DOWN").length
      }))
    };

    return NextResponse.json(problemWithVotes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}