"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Filter, CheckCircle, MessageSquare, TrendingUp, ArrowLeft, X } from "lucide-react";

const categories = [
  "All Categories",
  "PRODUCT_DEVELOPMENT",
  "MARKETING",
  "FUNDRAISING",
  "OPERATIONS",
  "HIRING",
  "LEGAL",
  "TECHNOLOGY",
  "STRATEGY"
];

const stages = [
  "All Stages",
  "IDEA",
  "MVP",
  "EARLY_STAGE",
  "GROWTH",
  "SCALING"
];

export default function KnowledgeBasePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStage, setSelectedStage] = useState("All Stages");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProblems(); }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems');
      if (response.ok) setProblems(await response.json());
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = false;

  const filteredProblems = problems.filter((problem: any) => {
    const matchesSearch =
      problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || problem.category === selectedCategory;
    const matchesStage = selectedStage === "All Stages" || problem.stage === selectedStage;
    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "Solved" && problem.isSolved) ||
      (selectedStatus === "Open" && !problem.isSolved);
    return matchesSearch && matchesCategory && matchesStage && matchesStatus;
  });

  const activeFilterCount = [
    selectedCategory !== "All Categories",
    selectedStage !== "All Stages",
    selectedStatus !== "All"
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("All Categories");
    setSelectedStage("All Stages");
    setSelectedStatus("All");
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-fade-in">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2 font-mono">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">

      {/* Header */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-4 font-mono border-border hover:border-accent/30"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-5 animate-slide-in">
        <h1 className="text-2xl md:text-h1 font-bold mb-1">Knowledge Base</h1>
        <p className="text-body text-sm md:text-base">Discover solutions to common entrepreneurial challenges.</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border font-mono text-sm"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative font-mono border-border hover:border-accent/30 flex-shrink-0"
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-accent-foreground text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Active Filter Pills */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCategory !== "All Categories" && (
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent border border-accent/30 rounded-full text-xs font-mono"
            >
              {selectedCategory} <X className="h-3 w-3" />
            </button>
          )}
          {selectedStage !== "All Stages" && (
            <button
              onClick={() => setSelectedStage("All Stages")}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent border border-accent/30 rounded-full text-xs font-mono"
            >
              {selectedStage} <X className="h-3 w-3" />
            </button>
          )}
          {selectedStatus !== "All" && (
            <button
              onClick={() => setSelectedStatus("All")}
              className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent border border-accent/30 rounded-full text-xs font-mono"
            >
              {selectedStatus} <X className="h-3 w-3" />
            </button>
          )}
          <button onClick={clearFilters} className="text-xs text-helper underline font-mono">
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="mb-4 animate-slide-in">
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block font-mono text-helper">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 text-sm border border-border bg-input text-foreground font-mono rounded-lg focus:border-accent outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block font-mono text-helper">Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full p-2 text-sm border border-border bg-input text-foreground font-mono rounded-lg focus:border-accent outline-none"
                >
                  {stages.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block font-mono text-helper">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2 text-sm border border-border bg-input text-foreground font-mono rounded-lg focus:border-accent outline-none"
                >
                  <option value="All">All Problems</option>
                  <option value="Open">Open</option>
                  <option value="Solved">Solved</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Banner */}
      {!isPremium && (
        <Card className="mb-4 border-premium bg-premium/5 animate-fade-in">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-sm font-sans">Unlock Expert Solutions – Go Premium</h3>
                <p className="text-xs text-helper font-mono mt-0.5">
                  Access premium solutions, advanced filters, and implementation guides.
                </p>
              </div>
              <Link href="/upgrade" className="flex-shrink-0">
                <Button className="btn-premium font-mono w-full sm:w-auto text-sm">
                  Go Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <p className="text-xs text-helper font-mono mb-3">
        {filteredProblems.length} problem{filteredProblems.length !== 1 ? "s" : ""} found
      </p>

      {/* Problem Feed */}
      <div className="space-y-3 animate-fade-in">
        {filteredProblems.map((problem: any, index: number) => (
          <Link key={problem.id} href={`/problems/${problem.id}`}>
            <Card className="problem-card animate-slide-in hover:border-accent/30 transition-all cursor-pointer" style={{ animationDelay: `${0.05 * index}s` }}>
              <CardContent className="pt-4 pb-4">
                {/* Title + Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm md:text-base font-sans hover:text-accent transition-colors leading-snug flex-1">
                    {problem.title}
                  </h3>
                  <Badge
                    className={`flex-shrink-0 text-xs ${problem.isSolved ? "verified-solution" : "tag-system"}`}
                  >
                    {problem.isSolved ? "Solved" : "Open"}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-helper text-xs md:text-sm mb-3 line-clamp-2 font-mono">
                  {problem.description}
                </p>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="tag-system text-xs">
                    {problem.category?.replace(/_/g, " ")}
                  </span>
                  <span className="tag-system text-xs">
                    {problem.stage?.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-helper font-mono">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                    <span>{problem._count?.solutions || 0} solutions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 flex-shrink-0" />
                    <span>{problem.upvotes || 0} upvotes</span>
                  </div>
                  <span className="hidden sm:inline">by {problem.createdBy?.name || "Unknown"}</span>
                  <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredProblems.length === 0 && (
        <Card className="animate-fade-in problem-card">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
            <h3 className="font-medium mb-1 font-sans">No problems found</h3>
            <p className="text-helper text-sm font-mono">
              Try adjusting your search or filters.
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4 text-sm font-mono">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
