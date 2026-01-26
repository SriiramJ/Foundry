import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const voteSchema = z.object({
  solutionId: z.string(),
  type: z.enum(["UP", "DOWN"])
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { solutionId, type } = voteSchema.parse(body);

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_solutionId: {
          userId: session.user.id,
          solutionId
        }
      }
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await prisma.vote.delete({
          where: { id: existingVote.id }
        });
        return NextResponse.json({ action: "removed" });
      } else {
        // Update vote type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        });
        return NextResponse.json({ action: "updated" });
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId: session.user.id,
          solutionId,
          type
        }
      });
      return NextResponse.json({ action: "created" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}