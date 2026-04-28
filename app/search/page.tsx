"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search, MessageSquare, CheckCircle, Users, ArrowLeft,
  FileText, Lightbulb, Star,
} from "lucide-react";

type Tab = "all" | "problems" | "solutions" | "mentors";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [tab, setTab] = useState<Tab>("all");
  const [results, setResults] = useState<any>({ problems: [], solutions: [], mentors: [] });
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults({ problems: [], solutions: [], mentors: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) setResults(await res.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setInputValue(q);
    if (q) doSearch(q);
  }, [searchParams, doSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  const total = results.problems.length + results.solutions.length + results.mentors.length;

  const tabs: { id: Tab; label: string; count: number; icon: any }[] = [
    { id: "all", label: "All", count: total, icon: Search },
    { id: "problems", label: "Problems", count: results.problems.length, icon: FileText },
    { id: "solutions", label: "Solutions", count: results.solutions.length, icon: Lightbulb },
    { id: "mentors", label: "Mentors", count: results.mentors.length, icon: Users },
  ];

  const showProblems = tab === "all" || tab === "problems";
  const showSolutions = tab === "all" || tab === "solutions";
  const showMentors = tab === "all" || tab === "mentors";

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="secondary" onClick={() => router.back()} className="mb-4 transform hover:scale-105 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      <div className="mb-6 animate-slide-in">
        <h1 className="text-h1 mb-2">Search</h1>
        <p className="text-body">Search across problems, solutions, and mentors.</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-10 font-mono"
          />
        </div>
        <Button type="submit" disabled={inputValue.trim().length < 2}>Search</Button>
      </form>

      {/* Tabs */}
      {query && (
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-mono">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
          <p className="text-helper mt-2 font-mono">Searching...</p>
        </div>
      )}

      {/* Empty state — no query */}
      {!loading && !query && (
        <div className="text-center py-16 animate-fade-in">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-helper font-mono">Type something to search across the platform.</p>
        </div>
      )}

      {/* No results */}
      {!loading && query && total === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-1">No results for "{query}"</p>
          <p className="text-helper text-sm font-mono">Try different keywords.</p>
        </div>
      )}

      {/* Results */}
      {!loading && query && total > 0 && (
        <div className="space-y-8">

          {/* Problems */}
          {showProblems && results.problems.length > 0 && (
            <section className="animate-fade-in">
              {tab === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Problems
                </h2>
              )}
              <div className="space-y-2">
                {results.problems.map((p: any, i: number) => (
                  <Link key={p.id} href={`/problems/${p.id}`}>
                    <Card className="problem-card hover:border-accent/30 transition-all cursor-pointer animate-slide-in" style={{ animationDelay: `${i * 0.04}s` }}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm hover:text-accent transition-colors">{p.title}</p>
                          <Badge className={`flex-shrink-0 text-xs ${p.isSolved ? "verified-solution" : "tag-system"}`}>
                            {p.isSolved ? "Solved" : "Open"}
                          </Badge>
                        </div>
                        <p className="text-xs text-helper font-mono line-clamp-2 mb-2">{p.description}</p>
                        <div className="flex items-center gap-3 text-xs text-helper font-mono">
                          <span className="tag-system">{p.category?.replace(/_/g, " ")}</span>
                          <span className="tag-system">{p.stage?.replace(/_/g, " ")}</span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />{p._count?.solutions || 0} solutions
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Solutions */}
          {showSolutions && results.solutions.length > 0 && (
            <section className="animate-fade-in">
              {tab === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Solutions
                </h2>
              )}
              <div className="space-y-2">
                {results.solutions.map((s: any, i: number) => (
                  <Link key={s.id} href={`/problems/${s.problem?.id}`}>
                    <Card className="problem-card hover:border-accent/30 transition-all cursor-pointer animate-slide-in" style={{ animationDelay: `${i * 0.04}s` }}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs text-helper font-mono">
                            Solution to: <span className="text-accent">{s.problem?.title}</span>
                          </p>
                          {s.isVerified && <Badge variant="verified" className="text-xs flex-shrink-0">Verified</Badge>}
                        </div>
                        <p className="text-sm font-mono line-clamp-2 mb-2">{s.excerpt}</p>
                        <div className="flex items-center gap-2 text-xs text-helper font-mono">
                          <span>by {s.author?.name}</span>
                          <Badge variant="default" className="text-xs">{s.author?.role}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Mentors */}
          {showMentors && results.mentors.length > 0 && (
            <section className="animate-fade-in">
              {tab === "all" && (
                <h2 className="text-sm font-semibold text-muted-foreground font-mono uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" /> Mentors
                </h2>
              )}
              <div className="space-y-2">
                {results.mentors.map((m: any, i: number) => (
                  <Link key={m.id} href={`/mentors/${m.id}`}>
                    <Card className="problem-card hover:border-accent/30 transition-all cursor-pointer animate-slide-in" style={{ animationDelay: `${i * 0.04}s` }}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{m.name}</p>
                                {m.isVerified && <Badge variant="verified" className="text-xs">Verified</Badge>}
                                {m.isPremium && <Badge variant="premium" className="text-xs">Premium</Badge>}
                              </div>
                              <p className="text-xs text-helper font-mono flex items-center gap-2">
                                <Star className="h-3 w-3" />{m.reputation} reputation
                                <CheckCircle className="h-3 w-3" />{m.solutionsCount} solutions
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
