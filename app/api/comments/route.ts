import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/comments?problemId=xxx or ?solutionId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get("problemId");
    const solutionId = searchParams.get("solutionId");

    if (!problemId && !solutionId) {
      return NextResponse.json({ error: "problemId or solutionId required" }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: problemId ? { problemId } : { solutionId: solutionId! },
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, problemId, solutionId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (!problemId && !solutionId) {
      return NextResponse.json({ error: "problemId or solutionId required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        ...(problemId ? { problemId } : { solutionId })
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}

// DELETE /api/comments?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Comment id required" }, { status: 400 });

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    if (comment.authorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to delete this comment" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment delete error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
