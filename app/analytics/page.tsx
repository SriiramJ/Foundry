"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, MessageSquare, CheckCircle, ThumbsUp, Star, Crown, BarChart2, Lock } from "lucide-react";

// ── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, color }: { data: number[]; labels: string[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-xs text-helper font-mono">{val}</span>
          <div
            className={`w-full rounded-t-sm transition-all duration-500 ${color}`}
            style={{ height: `${(val / max) * 96}px`, minHeight: val > 0 ? "4px" : "0" }}
          />
          <span className="text-xs text-helper font-mono">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card className="problem-card">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-mono">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-helper mt-1 font-mono">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Category Bar ─────────────────────────────────────────────────────────────
function CategoryRow({ category, count, max }: { category: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const label = category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-mono">
        <span>{label}</span>
        <span className="text-helper">{count}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => {
        if (r.status === 403) { setIsPremium(false); setLoading(false); return null; }
        setIsPremium(true);
        return r.json();
      })
      .then((d) => { if (d) setData(d); })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="text-helper mt-2 font-mono">Loading analytics...</p>
      </div>
    );
  }

  // ── Upgrade gate ──────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="mb-8 animate-slide-in">
          <h1 className="text-h1 mb-2 flex items-center gap-3">
            <BarChart2 className="h-8 w-8 text-accent" /> Analytics
          </h1>
          <p className="text-body">Deep insights into your activity and impact.</p>
        </div>

        {/* Blurred preview */}
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none opacity-60">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {["Problems Posted", "Solutions Given", "Upvotes Received", "Verified Solutions"].map((l) => (
                <Card key={l} className="problem-card">
                  <CardContent className="pt-5">
                    <p className="text-sm text-muted-foreground font-mono mb-2">{l}</p>
                    <div className="text-2xl font-bold">—</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="problem-card mb-6">
              <CardHeader><CardTitle>Activity Over Time</CardTitle></CardHeader>
              <CardContent>
                <div className="h-32 flex items-end gap-2">
                  {[40, 65, 30, 80, 55, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-accent/40 rounded-t-sm" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="w-full max-w-md text-center shadow-2xl border-accent/30 animate-scale-in">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-warning" /> Premium Feature
                </h2>
                <p className="text-helper mb-6 font-mono text-sm">
                  Upgrade to Premium or Pro to unlock detailed analytics — track your growth, top problems, category breakdown, and more.
                </p>
                <Link href="/upgrade">
                  <Button className="w-full btn-premium transform hover:scale-105 transition-all">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { overview, charts, topProblems, categoryBreakdown } = data;
  const maxCategory = Math.max(...categoryBreakdown.map((c: any) => c.count), 1);

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2 flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-accent" /> Analytics
        </h1>
        <p className="text-body">Your activity and impact over time.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard icon={MessageSquare} label="Problems Posted" value={overview.totalProblems} sub={`${overview.daysSinceJoined} days on Foundry`} />
        <StatCard icon={CheckCircle} label="Solutions Given" value={overview.totalSolutions} sub={`${overview.avgSolutionsPerProblem} avg per problem`} />
        <StatCard icon={ThumbsUp} label="Upvotes Received" value={overview.totalUpvotes} sub={`${overview.upvoteRate}% upvote rate`} />
        <StatCard icon={Star} label="Verified Solutions" value={overview.verifiedSolutions} sub="marked as verified by problem owners" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="problem-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Problems Posted</CardTitle>
            <CardDescription className="font-mono text-xs">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={charts.problemsOverTime} labels={charts.months} color="bg-accent" />
          </CardContent>
        </Card>

        <Card className="problem-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Solutions Given</CardTitle>
            <CardDescription className="font-mono text-xs">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={charts.solutionsOverTime} labels={charts.months} color="bg-success/70" />
          </CardContent>
        </Card>

        <Card className="problem-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">Upvotes Received</CardTitle>
            <CardDescription className="font-mono text-xs">Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={charts.upvotesOverTime} labels={charts.months} color="bg-warning/70" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Problems */}
        <Card className="problem-card animate-fade-in">
          <CardHeader>
            <CardTitle className="font-sans">Top Problems by Engagement</CardTitle>
            <CardDescription className="font-mono">Your problems with the most solutions</CardDescription>
          </CardHeader>
          <CardContent>
            {topProblems.length === 0 ? (
              <p className="text-helper text-center font-mono text-sm">No problems posted yet</p>
            ) : (
              <div className="space-y-3">
                {topProblems.map((p: any, i: number) => (
                  <Link key={p.id} href={`/problems/${p.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg font-bold text-muted-foreground w-5 shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <p className="text-xs text-helper font-mono">{p.category.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Badge className={p.isSolved ? "verified-solution" : "tag-system"}>
                          {p.isSolved ? "Solved" : "Open"}
                        </Badge>
                        <span className="text-sm font-mono text-helper">{p.solutionCount} sol.</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="problem-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardHeader>
            <CardTitle className="font-sans">Problems by Category</CardTitle>
            <CardDescription className="font-mono">Where you focus most</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryBreakdown.length === 0 ? (
              <p className="text-helper text-center font-mono text-sm">No problems posted yet</p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown
                  .sort((a: any, b: any) => b.count - a.count)
                  .map((c: any, i: number) => (
                    <CategoryRow key={c.category} category={c.category} count={c.count} max={maxCategory} />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upvote Rate Card */}
      <Card className="problem-card mt-6 animate-fade-in">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-accent flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-accent">{overview.upvoteRate}%</span>
              </div>
              <div>
                <p className="font-semibold font-sans">Solution Approval Rate</p>
                <p className="text-sm text-helper font-mono">
                  {overview.totalUpvotes} upvotes vs {overview.totalUpvotes + (overview.totalDownvotes ?? 0) - overview.totalUpvotes} downvotes across all your solutions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm font-mono text-helper">
                {overview.upvoteRate >= 70 ? "Great engagement!" : overview.upvoteRate >= 40 ? "Keep improving" : "Room to grow"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
