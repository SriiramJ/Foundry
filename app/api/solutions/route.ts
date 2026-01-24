import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSolutionSchema = z.object({
  content: z.string().min(20),
  actionSteps: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
  problemId: z.string()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSolutionSchema.parse(body);

    const solution = await prisma.solution.create({
      data: {
        content: validatedData.content,
        actionSteps: validatedData.actionSteps?.filter(step => step.trim()) || [],
        tools: validatedData.tools?.filter(tool => tool.trim()) || [],
        problemId: validatedData.problemId,
        authorId: session.user.id
      },
      include: {
        author: { select: { name: true, role: true, reputation: true } }
      }
    });

    return NextResponse.json(solution);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create solution" }, { status: 500 });
  }
}