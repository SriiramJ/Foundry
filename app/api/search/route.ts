import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ problems: [], solutions: [], mentors: [] });
    }

    const [problems, solutions, mentors] = await Promise.all([
      prisma.problem.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          stage: true,
          isSolved: true,
          createdAt: true,
          _count: { select: { solutions: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.solution.findMany({
        where: {
          content: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          content: true,
          isVerified: true,
          createdAt: true,
          problem: { select: { id: true, title: true } },
          author: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      prisma.user.findMany({
        where: {
          role: "MENTOR",
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          reputation: true,
          isPremium: true,
          _count: { select: { solutions: true } },
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      problems,
      solutions: solutions.map((s) => ({
        ...s,
        excerpt: s.content.length > 150 ? s.content.slice(0, 150) + "…" : s.content,
      })),
      mentors: mentors.map((m, i) => ({
        ...m,
        solutionsCount: m._count.solutions,
        isVerified: m.reputation > 100,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
