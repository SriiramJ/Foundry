import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeeklyDigestEmail } from "@/lib/email";

// Protect with a shared secret so only a cron job can trigger this
export async function POST(request: NextRequest) {
  // Vercel cron sends the secret as a header automatically
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Top problems with activity this week
  const problems = await prisma.problem.findMany({
    where: { createdAt: { gte: since } },
    select: {
      id: true,
      title: true,
      _count: { select: { solutions: true } },
    },
    orderBy: { solutions: { _count: "desc" } },
    take: 10,
  });

  if (problems.length === 0) {
    return NextResponse.json({ sent: 0, message: "No activity this week" });
  }

  const digestProblems = problems.map((p) => ({
    id: p.id,
    title: p.title,
    solutionCount: p._count.solutions,
  }));

  // Find all users who opted into weekly digest
  const users = await prisma.user.findMany({
    where: { notifyWeeklyDigest: true },
    select: { email: true },
  });

  await Promise.allSettled(
    users.map((u) => sendWeeklyDigestEmail(u.email, digestProblems))
  );

  return NextResponse.json({ sent: users.length });
}
