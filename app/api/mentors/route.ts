import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const expertiseOptions = [
  "Product Development", "Marketing", "Fundraising", "Operations", 
  "Hiring", "Legal", "Technology", "Strategy"
];

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

export async function GET() {
  try {
    const mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: {
        id: true,
        name: true,
        reputation: true,
        createdAt: true,
        isPremium: true,
        _count: {
          select: {
            solutions: true
          }
        }
      },
      orderBy: { reputation: "desc" },
      take: 50
    });

    const mentorsWithStats = mentors.map((mentor, index) => {
      const solutionCount = mentor._count.solutions;
      const rating = Math.min(4.2 + (solutionCount * 0.1), 5.0);
      const responseTime = solutionCount > 10 ? "< 2 hours" : solutionCount > 5 ? "< 4 hours" : "< 8 hours";
      
      return {
        id: mentor.id,
        name: mentor.name || 'Anonymous',
        title: titles[index % titles.length],
        expertise: expertiseOptions.slice(index % 3, (index % 3) + 3),
        reputation: mentor.reputation,
        solutionsCount: solutionCount,
        rating: Math.round(rating * 10) / 10,
        responseTime,
        bio: bios[index % bios.length],
        isPremium: mentor.isPremium,
        isVerified: mentor.reputation > 100
      };
    });

    return NextResponse.json(mentorsWithStats);
  } catch (error) {
    console.error('Mentors fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }
}