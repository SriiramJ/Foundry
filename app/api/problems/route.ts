import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProblemSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(50),
  category: z.enum(["PRODUCT_DEVELOPMENT", "MARKETING", "FUNDRAISING", "OPERATIONS", "HIRING", "LEGAL", "TECHNOLOGY", "STRATEGY"]),
  stage: z.enum(["IDEA", "MVP", "EARLY_STAGE", "GROWTH", "SCALING"]),
  tags: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProblemSchema.parse(body);

    const problem = await prisma.problem.create({
      data: {
        ...validatedData,
        tags: validatedData.tags || [],
        createdById: session.user.id
      },
      include: {
        createdBy: { select: { name: true, role: true } },
        solutions: { include: { author: { select: { name: true, role: true, reputation: true } } } }
      }
    });

    return NextResponse.json(problem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        createdBy: { select: { name: true, role: true } },
        solutions: { 
          include: { 
            author: { select: { name: true, role: true } },
            votes: { where: { type: "UP" } }
          } 
        },
        _count: { select: { solutions: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const problemsWithUpvotes = problems.map(problem => ({
      ...problem,
      upvotes: problem.solutions.reduce((total, solution) => 
        total + solution.votes.length, 0
      )
    }));

    return NextResponse.json(problemsWithUpvotes);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}