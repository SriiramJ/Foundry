import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendNewSolutionEmail } from "@/lib/email";

const createSolutionSchema = z.object({
  content: z.string().min(10),
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

    // Notify problem author if they opted in and it's not their own solution
    const problem = await prisma.problem.findUnique({
      where: { id: validatedData.problemId },
      include: { createdBy: { select: { id: true, email: true, notifyNewSolutions: true } } }
    });
    if (
      problem &&
      problem.createdBy.id !== session.user.id &&
      problem.createdBy.notifyNewSolutions &&
      problem.createdBy.email
    ) {
      sendNewSolutionEmail(problem.createdBy.email, problem.title, problem.id).catch((err) => console.error('Solution email error:', err));
    }

    return NextResponse.json(solution);
  } catch (error) {
    console.error('Solution creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Failed to create solution" }, { status: 500 });
  }
}