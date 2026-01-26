"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  stage: string;
  createdAt: string;
  createdBy: {
    name: string;
    role: string;
  };
  upvotes: number;
  _count: {
    solutions: number;
  };
}

export default function ProblemsPage() {
  const router = useRouter();
  const [problems, setProblems] = useState<Problem[]>([]);
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
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="secondary" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => router.push('/post-problem')}>
          Post Problem
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community Problems</h1>
        <p className="text-lg text-muted-foreground">
          Browse problems shared by entrepreneurs and help solve them
        </p>
      </div>

      <div className="grid gap-6">
        {problems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No problems posted yet</p>
            </CardContent>
          </Card>
        ) : (
          problems.map((problem) => (
            <Card key={problem.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/problems/${problem.id}`)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{problem.title}</CardTitle>
                    <CardDescription className="text-base mb-4">
                      {problem.description.substring(0, 200)}...
                    </CardDescription>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">{problem.category}</Badge>
                      <Badge variant="outline">{problem.stage}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{problem.createdBy.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{problem._count.solutions} solutions</span>
                    </div>
                    <span>{problem.upvotes} upvotes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}