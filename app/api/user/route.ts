import { NextRequest, NextResponse } from "next/server";
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
      include: {
        problems: {
          include: { _count: { select: { solutions: true } } },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        solutions: {
          include: { 
            problem: { select: { title: true } },
            votes: true
          },
          orderBy: { createdAt: "desc" },
          take: 5
        },
        mentorApplication: true,
        subscription: true,
        _count: {
          select: {
            problems: true,
            solutions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const upvotesReceived = user.solutions.reduce((total, solution) => 
      total + solution.votes.filter(v => v.type === "UP").length, 0
    );

    const verifiedSolutions = user.solutions.filter(s => s.isVerified).length;

    return NextResponse.json({
      ...user,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorSecret: undefined, // never expose secret
      upvotesReceived,
      verifiedSolutions,
      mentorApplication: user.mentorApplication
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

// PATCH /api/user — update avatar
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await request.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "image is required" }, { status: 400 });
    }

    // Accept only base64 data URLs (jpeg/png/webp)
    if (!image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image format" }, { status: 400 });
    }

    // Limit to ~2MB (base64 ~2.7MB raw)
    if (image.length > 2_800_000) {
      return NextResponse.json({ error: "Image too large. Max 2MB." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
