import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const problem = await prisma.problem.findUnique({
      where: { id },
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const problem = await prisma.problem.findUnique({ where: { id } });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    if (problem.createdById !== session.user.id) {
      return NextResponse.json({ error: "Only the problem owner can mark it as solved" }, { status: 403 });
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: { isSolved: !problem.isSolved }
    });

    return NextResponse.json({ isSolved: updated.isSolved });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}