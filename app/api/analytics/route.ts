import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true, role: true, createdAt: true },
    });

    if (!user?.isPremium && user?.role !== "MENTOR") {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const now = new Date();
    const userId = session.user.id;

    // Build last 6 months labels + date ranges
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        label: d.toLocaleString("default", { month: "short" }),
        start: d,
        end: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    });

    // Parallel fetch everything
    const [
      problemsByMonth,
      solutionsByMonth,
      upvotesByMonth,
      allProblems,
      allSolutions,
      totalUpvotes,
      totalDownvotes,
      verifiedSolutions,
      topProblems,
      categoryBreakdown,
    ] = await Promise.all([
      // Problems per month
      Promise.all(
        months.map((m) =>
          prisma.problem.count({
            where: { createdById: userId, createdAt: { gte: m.start, lt: m.end } },
          })
        )
      ),
      // Solutions per month
      Promise.all(
        months.map((m) =>
          prisma.solution.count({
            where: { authorId: userId, createdAt: { gte: m.start, lt: m.end } },
          })
        )
      ),
      // Upvotes received per month
      Promise.all(
        months.map((m) =>
          prisma.vote.count({
            where: {
              type: "UP",
              solution: { authorId: userId },
              createdAt: { gte: m.start, lt: m.end },
            },
          })
        )
      ),
      // All-time totals
      prisma.problem.count({ where: { createdById: userId } }),
      prisma.solution.count({ where: { authorId: userId } }),
      prisma.vote.count({ where: { type: "UP", solution: { authorId: userId } } }),
      prisma.vote.count({ where: { type: "DOWN", solution: { authorId: userId } } }),
      prisma.solution.count({ where: { authorId: userId, isVerified: true } }),
      // Top 5 problems by solution count
      prisma.problem.findMany({
        where: { createdById: userId },
        include: { _count: { select: { solutions: true } } },
        orderBy: { solutions: { _count: "desc" } },
        take: 5,
      }),
      // Problems by category
      prisma.problem.groupBy({
        by: ["category"],
        where: { createdById: userId },
        _count: { category: true },
      }),
    ]);

    // Solution upvote rate
    const upvoteRate =
      totalUpvotes + totalDownvotes > 0
        ? Math.round((totalUpvotes / (totalUpvotes + totalDownvotes)) * 100)
        : 0;

    // Avg solutions per problem
    const avgSolutionsPerProblem =
      allProblems > 0 ? (allSolutions / allProblems).toFixed(1) : "0";

    // Days since joined
    const daysSinceJoined = Math.floor(
      (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      overview: {
        totalProblems: allProblems,
        totalSolutions: allSolutions,
        totalUpvotes,
        verifiedSolutions,
        upvoteRate,
        avgSolutionsPerProblem,
        daysSinceJoined,
      },
      charts: {
        months: months.map((m) => m.label),
        problemsOverTime: problemsByMonth,
        solutionsOverTime: solutionsByMonth,
        upvotesOverTime: upvotesByMonth,
      },
      topProblems: topProblems.map((p) => ({
        id: p.id,
        title: p.title,
        solutionCount: p._count.solutions,
        category: p.category,
        isSolved: p.isSolved,
      })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
