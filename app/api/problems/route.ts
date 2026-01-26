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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    console.error('Problem creation error:', error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        stage: true,
        tags: true,
        createdAt: true,
        createdBy: { select: { name: true, role: true } },
        _count: { 
          select: { 
            solutions: true
          } 
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    return NextResponse.json(problems.map(p => ({ ...p, upvotes: 0 })));
  } catch (error) {
    console.error('Problems fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}