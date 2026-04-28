"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, RefreshCw, CheckCircle, Clock, Zap,
  BookOpen, Briefcase, ChevronDown, ChevronUp,
  AlertCircle, Sparkles, Target, TrendingUp, Award,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RoadmapItem {
  topic: string;
  tasks: string[];
  project: string;
  timeline: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Roadmap {
  stage: string;
  summary: string;
  roadmap: RoadmapItem[];
  generatedAt: string;
  cached: boolean;
}

// ── Config ────────────────────────────────────────────────────────────────────
const DIFFICULTY = {
  easy:   { label: "Easy",   color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", bar: "bg-emerald-400", dot: "bg-emerald-400" },
  medium: { label: "Medium", color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/30",   bar: "bg-amber-400",   dot: "bg-amber-400"   },
  hard:   { label: "Hard",   color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/30",    bar: "bg-rose-400",    dot: "bg-rose-400"    },
};

const STAGE = {
  beginner:     { label: "Beginner",     color: "text-accent",       bg: "bg-accent/10",       border: "border-accent/30",       icon: <TrendingUp className="h-4 w-4" /> },
  intermediate: { label: "Intermediate", color: "text-amber-400",    bg: "bg-amber-400/10",    border: "border-amber-400/30",    icon: <Zap className="h-4 w-4" /> },
  advanced:     { label: "Advanced",     color: "text-emerald-400",  bg: "bg-emerald-400/10",  border: "border-emerald-400/30",  icon: <TrendingUp className="h-4 w-4" /> },
  expert:       { label: "Expert",       color: "text-purple-400",   bg: "bg-purple-400/10",   border: "border-purple-400/30",   icon: <Award className="h-4 w-4" /> },
};

// ── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-border" />
          <circle
            cx="36" cy="36" r={r} fill="none" strokeWidth="5"
            stroke="currentColor" className={color}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{value}</span>
      </div>
      <span className="text-xs text-helper font-mono text-center">{label}</span>
    </div>
  );
}

// ── Roadmap Card ──────────────────────────────────────────────────────────────
function RoadmapCard({ item, index, total }: { item: RoadmapItem; index: number; total: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const diff = DIFFICULTY[item.difficulty] ?? DIFFICULTY.easy;
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0 z-10 transition-all ${
          expanded
            ? `${diff.bg} ${diff.border} ${diff.color}`
            : "bg-muted border-border text-muted-foreground"
        }`}>
          {index + 1}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 mt-1 bg-border min-h-[24px]" />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-6 rounded-xl border transition-all duration-300 overflow-hidden ${
        expanded ? "border-border shadow-sm" : "border-border/50"
      }`}>
        {/* Header */}
        <button
          onClick={() => setExpanded(p => !p)}
          className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors group"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug group-hover:text-accent transition-colors">{item.topic}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-mono ${diff.bg} ${diff.border} ${diff.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                {diff.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-helper font-mono">
                <Clock className="h-3 w-3" />{item.timeline}
              </span>
              <span className="flex items-center gap-1 text-xs text-helper font-mono">
                <CheckCircle className="h-3 w-3" />{item.tasks.length} tasks
              </span>
            </div>
          </div>
          <div className={`mt-0.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown className="h-4 w-4 text-helper" />
          </div>
        </button>

        {/* Expanded body */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4 animate-fade-in">
            {/* Tasks */}
            <div>
              <p className="text-xs font-semibold text-helper uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" /> Action Tasks
              </p>
              <div className="space-y-2">
                {item.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-3 group/task">
                    <div className="mt-1 w-5 h-5 rounded-full border border-border flex items-center justify-center shrink-0 group-hover/task:border-accent transition-colors">
                      <span className="text-[10px] font-bold text-helper">{i + 1}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{task}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini project */}
            <div className={`rounded-lg p-4 border ${diff.bg} ${diff.border}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1.5 ${diff.color}`}>
                <Briefcase className="h-3.5 w-3.5" /> Mini Project
              </p>
              <p className="text-sm leading-relaxed">{item.project}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadRoadmap(); }, []);

  const loadRoadmap = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/roadmap/generate");
      if (res.ok) {
        setRoadmap(await res.json());
      } else {
        await generateRoadmap(false);
      }
    } catch {
      setError("Failed to load roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const generateRoadmap = async (force = true) => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRegenerate: force }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate roadmap."); return; }
      setRoadmap(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || generating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Sparkles className="h-9 w-9 text-accent animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
        </div>
        <h2 className="text-lg font-semibold mb-2">
          {generating ? "Crafting your roadmap…" : "Loading…"}
        </h2>
        <p className="text-sm text-helper font-mono text-center max-w-sm">
          {generating
            ? "Analysing your progress and building a personalised entrepreneurship plan."
            : "Fetching your saved roadmap…"}
        </p>
        <div className="flex gap-1.5 mt-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6 max-w-lg mx-auto animate-fade-in">
        <Button variant="secondary" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <div className="rounded-xl border border-rose-400/30 bg-rose-400/5 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-400/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7 text-rose-400" />
          </div>
          <h3 className="font-semibold">Could not generate roadmap</h3>
          <p className="text-sm text-helper font-mono">{error}</p>
          <Button onClick={() => generateRoadmap(true)} className="transform hover:scale-105 transition-all">
            <RefreshCw className="mr-2 h-4 w-4" />Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  const stage = STAGE[roadmap.stage as keyof typeof STAGE] ?? STAGE.beginner;
  const totalTasks = roadmap.roadmap.reduce((s, r) => s + r.tasks.length, 0);
  const cacheAge = roadmap.generatedAt
    ? Math.round((Date.now() - new Date(roadmap.generatedAt).getTime()) / (1000 * 60))
    : null;

  const easyCnt   = roadmap.roadmap.filter(r => r.difficulty === "easy").length;
  const mediumCnt = roadmap.roadmap.filter(r => r.difficulty === "medium").length;
  const hardCnt   = roadmap.roadmap.filter(r => r.difficulty === "hard").length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl border border-border bg-gradient-to-br from-accent/5 via-background to-muted/30 p-6 mb-6 overflow-hidden animate-scale-in">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-lg ${stage.bg} ${stage.border} border flex items-center justify-center ${stage.color}`}>
                {stage.icon}
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border font-mono ${stage.bg} ${stage.border} ${stage.color}`}>
                {stage.label}
              </span>
              {roadmap.cached && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-helper font-mono">
                  Cached
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold mb-2 font-sans">Your Learning Roadmap</h1>
            <p className="text-sm text-helper leading-relaxed max-w-lg">{roadmap.summary}</p>

            {cacheAge !== null && (
              <p className="text-xs text-helper font-mono mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {roadmap.cached
                  ? `Updated ${cacheAge < 60 ? `${cacheAge} min` : `${Math.round(cacheAge / 60)} hr`} ago`
                  : "Just generated"}
              </p>
            )}
          </div>

          <Button
            onClick={() => generateRoadmap(true)}
            disabled={generating}
            variant="secondary"
            className="shrink-0 transform hover:scale-105 transition-all"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>

        {/* Stats row */}
        <div className="relative flex items-center gap-6 mt-6 pt-5 border-t border-border/50 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4 text-accent" />
            <span className="font-semibold">{roadmap.roadmap.length}</span>
            <span className="text-helper">topics</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-accent" />
            <span className="font-semibold">{totalTasks}</span>
            <span className="text-helper">tasks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-accent" />
            <span className="font-semibold">{roadmap.roadmap.length}</span>
            <span className="text-helper">projects</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            {easyCnt > 0   && <span className="text-xs font-mono text-emerald-400">{easyCnt} easy</span>}
            {mediumCnt > 0 && <span className="text-xs font-mono text-amber-400">{mediumCnt} medium</span>}
            {hardCnt > 0   && <span className="text-xs font-mono text-rose-400">{hardCnt} hard</span>}
          </div>
        </div>
      </div>

      {/* ── Difficulty Progress Bar ──────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-helper font-mono mb-2">
          <span>Difficulty progression</span>
          <span>Easy → Hard</span>
        </div>
        <div className="flex gap-1 h-2 rounded-full overflow-hidden">
          {roadmap.roadmap.map((item, i) => (
            <div
              key={i}
              className={`flex-1 transition-all duration-500 ${DIFFICULTY[item.difficulty]?.bar ?? "bg-accent"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>

      {/* ── Stats Rings ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl border border-border bg-muted/20">
        <ProgressRing value={easyCnt}   max={roadmap.roadmap.length} label="Easy"   color="text-emerald-400" />
        <ProgressRing value={mediumCnt} max={roadmap.roadmap.length} label="Medium" color="text-amber-400"   />
        <ProgressRing value={hardCnt}   max={roadmap.roadmap.length} label="Hard"   color="text-rose-400"    />
      </div>

      {/* ── Timeline ────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-4 w-4 text-accent" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-helper font-mono">Your Path</h2>
        </div>

        <div>
          {roadmap.roadmap.map((item, i) => (
            <RoadmapCard key={i} item={item} index={i} total={roadmap.roadmap.length} />
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <div className="mt-4 p-4 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
        <Award className="h-5 w-5 text-accent shrink-0" />
        <p className="text-xs text-helper font-mono leading-relaxed">
          This roadmap is personalised based on your activity, reputation, and startup stage. Regenerate anytime as you progress.
        </p>
      </div>
    </div>
  );
}
