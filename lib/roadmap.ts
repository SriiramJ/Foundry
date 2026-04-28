import { Category, StartupStage } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProgress {
  role: string;
  reputation: number;
  problemsPosted: number;
  solutionsGiven: number;
  verifiedSolutions: number;
  categories: Category[];       // categories the user has engaged with
  startupStage: StartupStage | null;
  weakAreas: string[];          // categories with 0 solutions
  completedSessions: number;
}

export interface RoadmapItem {
  topic: string;
  tasks: string[];
  project: string;
  timeline: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface RoadmapResponse {
  stage: string;
  summary: string;
  roadmap: RoadmapItem[];
  generatedAt: string;
}

// ── Stage Determination (rule-based, no AI) ───────────────────────────────────

export function determineStage(progress: UserProgress): string {
  const { reputation, solutionsGiven, verifiedSolutions, problemsPosted, completedSessions } = progress;

  if (reputation >= 500 && verifiedSolutions >= 5 && completedSessions >= 3) return "expert";
  if (reputation >= 200 && solutionsGiven >= 10 && problemsPosted >= 5)       return "advanced";
  if (reputation >= 50  && solutionsGiven >= 3  && problemsPosted >= 2)       return "intermediate";
  return "beginner";
}

// ── Rule-Based Enhancements applied BEFORE sending to AI ─────────────────────

export function applyRules(progress: UserProgress, stage: string): string[] {
  const hints: string[] = [];

  // Rule 1: fundamentals first for beginners
  if (stage === "beginner") {
    hints.push("User is a beginner — start with foundational entrepreneurship concepts.");
    hints.push("Avoid advanced topics like fundraising term sheets or scaling operations.");
  }

  // Rule 2: prioritise weak areas
  if (progress.weakAreas.length > 0) {
    hints.push(`User has weak areas in: ${progress.weakAreas.join(", ")}. Prioritise these topics.`);
  }

  // Rule 3: no problems posted yet
  if (progress.problemsPosted === 0) {
    hints.push("User has never posted a problem — include a task to articulate and post their first business challenge.");
  }

  // Rule 4: no solutions given
  if (progress.solutionsGiven === 0) {
    hints.push("User has never contributed a solution — include a task to help peers and build reputation.");
  }

  // Rule 5: mentor role
  if (progress.role === "MENTOR") {
    hints.push("User is a mentor — focus on advanced topics, teaching skills, and session management.");
  }

  return hints;
}

// ── Prompt Builder ────────────────────────────────────────────────────────────

export function buildPrompt(progress: UserProgress, stage: string, hints: string[]): string {
  return `
You are an expert entrepreneurship mentor and learning coach.
Your task is to generate a personalized learning roadmap for an entrepreneur on the Foundry platform.

## User Profile
- Role: ${progress.role}
- Reputation: ${progress.reputation} points
- Stage determined: ${stage}
- Problems posted: ${progress.problemsPosted}
- Solutions given: ${progress.solutionsGiven}
- Verified solutions: ${progress.verifiedSolutions}
- Completed mentor sessions: ${progress.completedSessions}
- Active categories: ${progress.categories.length > 0 ? progress.categories.join(", ") : "none yet"}
- Startup stage focus: ${progress.startupStage ?? "not specified"}
- Weak areas (needs improvement): ${progress.weakAreas.length > 0 ? progress.weakAreas.join(", ") : "none identified"}

## Coaching Rules (MUST follow)
${hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}

## Instructions
- Generate exactly 5 roadmap items ordered by difficulty progression (easy → hard).
- Each item must be actionable and specific to entrepreneurship on the Foundry platform.
- Tasks should be concrete actions the user can do on the platform (post problems, give solutions, book sessions, etc.).
- Projects should be real mini-projects an entrepreneur can build or execute.
- Timelines should be realistic (1–7 days per item).
- Do NOT include generic programming topics — this is an entrepreneurship platform.

## Output Format
Respond ONLY with valid JSON. No markdown, no explanation, no code fences.
The JSON must strictly follow this schema:

{
  "stage": "${stage}",
  "summary": "One sentence describing the user's current level and focus.",
  "roadmap": [
    {
      "topic": "Topic name",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "project": "Mini project description",
      "timeline": "X days",
      "difficulty": "easy" | "medium" | "hard"
    }
  ],
  "generatedAt": "${new Date().toISOString()}"
}
`.trim();
}
