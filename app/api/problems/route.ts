import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, category, stage, tags } = await request.json();

    if (!title || !description || !category || !stage) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        category: category.toUpperCase(),
        stage: stage.toUpperCase(),
        tags: tags || [],
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    });

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Problem creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const stage = searchParams.get("stage");

    const where: any = {};
    if (category) where.category = category.toUpperCase();
    if (stage) where.stage = stage.toUpperCase();

    const problems = await prisma.problem.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        solutions: {
          select: {
            id: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            solutions: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error("Problems fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}