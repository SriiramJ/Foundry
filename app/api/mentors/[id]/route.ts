import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const titles = [
  "Serial Entrepreneur", "Startup Advisor", "Tech Founder",
  "Growth Expert", "Product Leader", "Marketing Strategist"
];

const bios = [
  "Helping entrepreneurs navigate their startup journey with proven strategies.",
  "20+ years building and scaling tech companies from idea to IPO.",
  "Former VP at Fortune 500, now mentoring the next generation of founders.",
  "Built 3 successful exits, passionate about product-market fit.",
  "Growth hacker turned mentor, specializing in customer acquisition."
];

const expertiseOptions = [
  "Product Development", "Marketing", "Fundraising", "Operations",
  "Hiring", "Legal", "Technology", "Strategy"
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const mentor = await prisma.user.findUnique({
      where: { id, role: "MENTOR" },
      select: {
        id: true,
        name: true,
        email: true,
        reputation: true,
        isPremium: true,
        createdAt: true,
        solutions: {
          select: {
            id: true,
            content: true,
            isVerified: true,
            createdAt: true,
            upvotes: true,
            problem: { select: { id: true, title: true, category: true } },
            votes: true
          },
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: { select: { solutions: true } }
      }
    });

    if (!mentor) {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const index = parseInt(id.slice(-1), 16) % titles.length;
    const solutionCount = mentor._count.solutions;
    const rating = Math.min(4.2 + solutionCount * 0.1, 5.0);

    return NextResponse.json({
      id: mentor.id,
      name: mentor.name || "Anonymous",
      title: titles[index % titles.length],
      bio: bios[index % bios.length],
      expertise: expertiseOptions.slice(index % 3, (index % 3) + 3),
      reputation: mentor.reputation,
      solutionsCount: solutionCount,
      rating: Math.round(rating * 10) / 10,
      responseTime: solutionCount > 10 ? "< 2 hours" : solutionCount > 5 ? "< 4 hours" : "< 8 hours",
      isPremium: mentor.isPremium,
      isVerified: mentor.reputation > 100,
      memberSince: mentor.createdAt,
      recentSolutions: mentor.solutions.map(s => ({
        id: s.id,
        content: s.content,
        isVerified: s.isVerified,
        createdAt: s.createdAt,
        upvotes: s.votes.filter(v => v.type === "UP").length,
        problem: s.problem
      }))
    });
  } catch (error) {
    console.error("Mentor profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch mentor profile" }, { status: 500 });
  }
}
