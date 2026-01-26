"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Filter, Lock, CheckCircle, MessageSquare, TrendingUp, ArrowLeft } from "lucide-react";

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
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/problems');
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
      } else {
        console.error('Failed to fetch problems:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = false; // session?.user?.isPremium || false; // Placeholder since isPremium not in session

  const filteredProblems = problems.filter((problem: any) => {
    const matchesSearch = problem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || problem.category === selectedCategory;
    const matchesStage = selectedStage === "All Stages" || problem.stage === selectedStage;
    
    return matchesSearch && matchesCategory && matchesStage;
  });

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2 font-mono">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6 transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Knowledge Base</h1>
        <p className="text-body">Discover solutions to common entrepreneurial challenges from the community.</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 problem-card animate-scale-in" style={{animationDelay: '0.2s'}}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
              <Input
                placeholder="Search problems and solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all focus:scale-105 bg-input border-border font-mono"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border animate-slide-in">
              <div>
                <label className="text-sm font-medium mb-2 block font-mono">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-border bg-input text-foreground font-mono transition-all hover:border-accent focus:border-accent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block font-mono">Startup Stage</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full p-2 border border-border bg-input text-foreground font-mono transition-all hover:border-accent focus:border-accent"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Upgrade Banner */}
      {!isPremium && (
        <Card className="mb-6 border-premium bg-premium/5 problem-card animate-fade-in" style={{animationDelay: '0.3s'}}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium mb-1 font-sans">Unlock Expert Solutions – Go Premium</h3>
                <p className="text-sm text-helper font-mono">
                  Get access to premium solutions, advanced filters, and detailed implementation guides.
                </p>
              </div>
              <Link href="/upgrade">
                <Button className="btn-premium transform hover:scale-105 transition-all font-mono">
                  Go Premium
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results - Problem Feed */}
      <div className="space-y-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
        {filteredProblems.map((problem: any, index: number) => (
          <Card key={problem.id} className="problem-card animate-slide-in" style={{animationDelay: `${0.1 * index}s`}}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link href={`/problems/${problem.id}`}>
                      <h3 className="font-medium hover:text-accent cursor-pointer transition-colors font-sans">
                        {problem.title}
                      </h3>
                    </Link>
                    {false && !isPremium && (
                      <Lock className="h-4 w-4 text-premium animate-pulse" />
                    )}
                  </div>
                  
                  {/* Premium Lock Experience */}
                  <div className={false && !isPremium ? "premium-lock" : ""}>
                    <p className="text-helper text-sm mb-3 line-clamp-2 font-mono">
                      {problem.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-helper font-mono">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>{problem._count?.solutions || 0} solutions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{problem.upvotes || 0} upvotes</span>
                    </div>
                    <span>by {problem.createdBy?.name || 'Unknown'}</span>
                    <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 ml-4">
                  <Badge className={problem.isSolved ? "verified-solution" : "tag-system"}>
                    {problem.isSolved ? "Solved" : "Open"}
                  </Badge>
                  <div className="flex gap-1">
                    <span className="tag-system">
                      #{problem.category}
                    </span>
                    <span className="tag-system">
                      #{problem.stage}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <Card className="animate-fade-in problem-card">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h3 className="font-medium mb-2 font-sans">No problems found</h3>
            <p className="text-helper font-mono">
              Try adjusting your search terms or filters to find relevant content.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}