import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendSolutionVerifiedEmail } from "@/lib/email";

// PATCH /api/solutions/[id] — toggle isVerified (problem owner only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const solution = await prisma.solution.findUnique({
      where: { id },
      include: {
        problem: { include: { createdBy: { select: { id: true } } } },
        author: { select: { email: true, name: true } },
      },
    });

    if (!solution) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    // Only the problem owner can verify solutions
    if (solution.problem.createdBy.id !== session.user.id) {
      return NextResponse.json({ error: "Only the problem owner can verify solutions" }, { status: 403 });
    }

    const updated = await prisma.solution.update({
      where: { id },
      data: { isVerified: !solution.isVerified },
    });

    // Send email only when newly verified (not when un-verifying)
    if (updated.isVerified && solution.author.email) {
      sendSolutionVerifiedEmail(solution.author.email, solution.problem.title, solution.problemId)
        .catch(err => console.error("Solution verified email error:", err));
    }

    return NextResponse.json({ isVerified: updated.isVerified });
  } catch (error) {
    console.error("Solution verify error:", error);
    return NextResponse.json({ error: "Failed to update solution" }, { status: 500 });
  }
}
