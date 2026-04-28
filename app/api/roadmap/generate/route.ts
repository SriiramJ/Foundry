import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import {
  UserProgress,
  RoadmapResponse,
  determineStage,
  applyRules,
  buildPrompt,
} from "@/lib/roadmap";
import { Category } from "@prisma/client";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Cache TTL: 24 hours
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));
    const forceRegenerate: boolean = body.forceRegenerate ?? false;

    // ── 1. Check cache ────────────────────────────────────────────────────────
    const cached = await prisma.roadmap.findUnique({ where: { userId } });
    if (cached && !forceRegenerate) {
      const age = Date.now() - new Date(cached.updatedAt).getTime();
      if (age < CACHE_TTL_MS) {
        return NextResponse.json({ ...cached.payload as object, cached: true });
      }
    }

    // ── 2. Fetch user progress ────────────────────────────────────────────────
    const [user, solutions, problems, sessions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, reputation: true },
      }),
      prisma.solution.findMany({
        where: { authorId: userId },
        select: { isVerified: true, problem: { select: { category: true } } },
      }),
      prisma.problem.findMany({
        where: { createdById: userId },
        select: { category: true, stage: true },
      }),
      prisma.mentorSession.findMany({
        where: { learnerId: userId, status: "COMPLETED" },
        select: { id: true },
      }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const categorySet = new Set<Category>([
      ...problems.map((p) => p.category),
      ...solutions.map((s) => s.problem.category),
    ]);

    const allCategories = Object.values(Category);
    const weakAreas = allCategories.filter((c) => !categorySet.has(c));
    const startupStage = problems.length > 0 ? problems[problems.length - 1].stage : null;

    const progress: UserProgress = {
      role: user.role,
      reputation: user.reputation,
      problemsPosted: problems.length,
      solutionsGiven: solutions.length,
      verifiedSolutions: solutions.filter((s) => s.isVerified).length,
      categories: Array.from(categorySet),
      startupStage,
      weakAreas,
      completedSessions: sessions.length,
    };

    // ── 3. Rule-based stage + prompt ─────────────────────────────────────────
    const stage = determineStage(progress);
    const hints = applyRules(progress, stage);
    const prompt = buildPrompt(progress, stage, hints);

    // ── 4. Call Groq ──────────────────────────────────────────────────────────
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert entrepreneurship mentor. Always respond with valid JSON only. No markdown, no explanation, no code fences.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from Groq");

    // Strip markdown fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const roadmap: RoadmapResponse = JSON.parse(cleaned);

    // ── 5. Cache in DB ────────────────────────────────────────────────────────
    await prisma.roadmap.upsert({
      where: { userId },
      create: { userId, stage, payload: roadmap as any },
      update: { stage, payload: roadmap as any },
    });

    return NextResponse.json({ ...roadmap, cached: false });
  } catch (error: any) {
    console.error("Roadmap generation error:", error);

    if (error?.status === 401 || error?.message?.includes("API_KEY")) {
      return NextResponse.json(
        { error: "Groq API key is not configured. Add GROQ_API_KEY to your .env file." },
        { status: 503 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Groq rate limit reached. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}

// GET — return cached roadmap without regenerating
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cached = await prisma.roadmap.findUnique({ where: { userId: session.user.id } });
    if (!cached) return NextResponse.json({ error: "No roadmap found" }, { status: 404 });

    return NextResponse.json({ ...cached.payload as object, cached: true });
  } catch {
    return NextResponse.json({ error: "Failed to fetch roadmap" }, { status: 500 });
  }
}
