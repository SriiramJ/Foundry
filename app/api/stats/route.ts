import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [totalProblems, totalSolutions, totalUpvotes] = await Promise.all([
      prisma.problem.count(),
      prisma.solution.count(),
      prisma.vote.count({ where: { type: "UP" } })
    ]);

    return NextResponse.json({
      totalProblems,
      totalSolutions,
      totalUpvotes,
      averageRating: 4.6 // Could be calculated from actual ratings
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}