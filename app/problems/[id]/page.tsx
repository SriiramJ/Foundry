"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar, Star, X, Plus, CheckCircle } from "lucide-react";
import { CommentSection } from "@/components/comment-section";

export default function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const resolvedParams = use(params);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  const [solutionForm, setSolutionForm] = useState({
    content: "",
    actionSteps: [""],
    tools: [""]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMarkingSolved, setIsMarkingSolved] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [votes, setVotes] = useState<{[key: string]: 'up' | 'down' | null}>({});

  useEffect(() => {
    fetchProblem();
  }, [resolvedParams.id]);

  const fetchProblem = async () => {
    try {
      const response = await fetch(`/api/problems/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setProblem(data);
      }
    } catch (error) {
      console.error('Failed to fetch problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSolved = async () => {
    setIsMarkingSolved(true);
    try {
      const response = await fetch(`/api/problems/${resolvedParams.id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        const data = await response.json();
        setProblem((prev: any) => ({ ...prev, isSolved: data.isSolved }));
      }
    } catch (error) {
      console.error('Failed to update problem status:', error);
    } finally {
      setIsMarkingSolved(false);
    }
  };

  const handleVote = async (solutionId: string, voteType: 'up' | 'down') => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          solutionId, 
          type: voteType.toUpperCase() 
        })
      });
      
      if (response.ok) {
        const currentVote = votes[solutionId];
        const newVote = currentVote === voteType ? null : voteType;
        setVotes(prev => ({ ...prev, [solutionId]: newVote }));
        fetchProblem();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleVerifySolution = async (solutionId: string) => {
    setVerifyingId(solutionId);
    try {
      const response = await fetch(`/api/solutions/${solutionId}`, { method: 'PATCH' });
      if (response.ok) fetchProblem();
    } catch (error) {
      console.error('Failed to verify solution:', error);
    } finally {
      setVerifyingId(null);
    }
  };

  const addActionStep = () => {
    setSolutionForm(prev => ({ ...prev, actionSteps: [...prev.actionSteps, ""] }));
  };

  const removeActionStep = (index: number) => {
    setSolutionForm(prev => ({ ...prev, actionSteps: prev.actionSteps.filter((_, i) => i !== index) }));
  };

  const updateActionStep = (index: number, value: string) => {
    setSolutionForm(prev => ({ ...prev, actionSteps: prev.actionSteps.map((step, i) => i === index ? value : step) }));
  };

  const addTool = () => {
    setSolutionForm(prev => ({ ...prev, tools: [...prev.tools, ""] }));
  };

  const removeTool = (index: number) => {
    setSolutionForm(prev => ({ ...prev, tools: prev.tools.filter((_, i) => i !== index) }));
  };

  const updateTool = (index: number, value: string) => {
    setSolutionForm(prev => ({ ...prev, tools: prev.tools.map((tool, i) => i === index ? value : tool) }));
  };

  const handleSubmitSolution = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: solutionForm.content,
          actionSteps: solutionForm.actionSteps.filter(step => step.trim()),
          tools: solutionForm.tools.filter(tool => tool.trim()),
          problemId: resolvedParams.id
        })
      });
      
      if (response.ok) {
        setShowSolutionForm(false);
        setSolutionForm({ content: "", actionSteps: [""], tools: [""] });
        fetchProblem();
      }
    } catch (error) {
      console.error('Failed to submit solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = session?.user?.id === problem?.createdById;

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {loading ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2">Loading problem...</p>
        </div>
      ) : !problem ? (
        <div>
          <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-center">
            <p className="text-helper">Problem not found</p>
          </div>
        </div>
      ) : (
        <div>
          <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="mb-6 card-hover animate-scale-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{problem.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-helper mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{problem.createdBy.name}</span>
                      <Badge variant="default" className="text-xs">{problem.createdBy.role}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <Button
                      size="sm"
                      variant={problem.isSolved ? "secondary" : "default"}
                      onClick={handleMarkSolved}
                      disabled={isMarkingSolved}
                      className="transform hover:scale-105 transition-all"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {isMarkingSolved ? "Updating..." : problem.isSolved ? "Mark as Open" : "Mark as Solved"}
                    </Button>
                  )}
                  <Badge variant={problem.isSolved ? "verified" : "default"} className={problem.isSolved ? "animate-pulse" : ""}>
                    {problem.isSolved ? "Solved" : "Open"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="default">{problem.category}</Badge>
                <Badge variant="default">{problem.stage}</Badge>
                {problem.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-body leading-relaxed">{problem.description}</p>
              <CommentSection problemId={problem.id} initialCount={problem.commentCount || 0} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center gap-2 animate-slide-in">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-h2">{problem.solutions.length} Solutions</h2>
            </div>

            {problem.solutions.map((solution: any, index: number) => (
              <Card key={solution.id} className="card-hover animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{solution.author.name}</span>
                          <Badge variant={solution.author.role === "MENTOR" ? "premium" : "default"} className="text-xs">
                            {solution.author.role}
                          </Badge>
                          {solution.isVerified && (
                            <Badge variant="verified" className="text-xs animate-pulse">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-helper">
                          <Star className="h-3 w-3" />
                          <span>{solution.author.reputation} reputation</span>
                          <span>•</span>
                          <span>{new Date(solution.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isOwner && (
                        <Button
                          variant={solution.isVerified ? "default" : "secondary"}
                          size="sm"
                          onClick={() => handleVerifySolution(solution.id)}
                          disabled={verifyingId === solution.id}
                          className="transform hover:scale-105 transition-all"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {solution.isVerified ? "Verified" : "Verify"}
                        </Button>
                      )}
                      <Button
                        variant={votes[solution.id] === 'up' ? "default" : "secondary"}
                        size="sm"
                        onClick={() => handleVote(solution.id, 'up')}
                        className="transform hover:scale-105 transition-all"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {solution.upvotes}
                      </Button>
                      <Button
                        variant={votes[solution.id] === 'down' ? "default" : "secondary"}
                        size="sm"
                        onClick={() => handleVote(solution.id, 'down')}
                        className="transform hover:scale-105 transition-all"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        {solution.downvotes}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-body mb-4">{solution.content}</p>

                  {solution.actionSteps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Action Steps:</h4>
                      <ol className="list-decimal list-inside space-y-2">
                        {solution.actionSteps.map((step: string, stepIndex: number) => (
                          <li key={stepIndex} className="text-sm text-helper">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {solution.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Recommended Tools:</h4>
                      <div className="flex gap-2 flex-wrap">
                        {solution.tools.map((tool: string) => (
                          <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <CommentSection solutionId={solution.id} initialCount={solution.commentCount || 0} />
                </CardContent>
              </Card>
            ))}
          </div>

          {!problem.isSolved && (
            <Card className="mt-6 card-hover animate-fade-in">
              <CardContent className="pt-6 text-center">
                <h3 className="font-medium mb-2">Have a solution to share?</h3>
                <p className="text-helper mb-4">Help the community by sharing your experience and insights.</p>
                <Button className="transform hover:scale-105 transition-all" onClick={() => setShowSolutionForm(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Your Solution
                </Button>
              </CardContent>
            </Card>
          )}

          {problem.isSolved && (
            <Card className="mt-6 border-success/30 bg-success/5 animate-fade-in">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-10 w-10 text-success mx-auto mb-2" />
                <h3 className="font-medium mb-1">This problem has been solved!</h3>
                <p className="text-helper text-sm">The problem owner has marked this as resolved.</p>
              </CardContent>
            </Card>
          )}

          {/* Solution Form Modal */}
          {showSolutionForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add Your Solution</CardTitle>
                    <Button variant="secondary" size="sm" onClick={() => setShowSolutionForm(false)} className="transform hover:scale-105 transition-all">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Solution</label>
                    <textarea
                      className="w-full min-h-[120px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      placeholder="Describe your solution and approach..."
                      value={solutionForm.content}
                      onChange={(e) => setSolutionForm(prev => ({ ...prev, content: e.target.value }))}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Action Steps (Optional)</label>
                      <Button type="button" variant="secondary" size="sm" onClick={addActionStep} className="transform hover:scale-105 transition-all">
                        <Plus className="h-4 w-4 mr-1" />Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {solutionForm.actionSteps.map((step, index) => (
                        <div key={index} className="flex gap-2">
                          <Input placeholder={`Step ${index + 1}...`} value={step} onChange={(e) => updateActionStep(index, e.target.value)} className="flex-1" />
                          {solutionForm.actionSteps.length > 1 && (
                            <Button type="button" variant="secondary" size="sm" onClick={() => removeActionStep(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Recommended Tools (Optional)</label>
                      <Button type="button" variant="secondary" size="sm" onClick={addTool} className="transform hover:scale-105 transition-all">
                        <Plus className="h-4 w-4 mr-1" />Add Tool
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {solutionForm.tools.map((tool, index) => (
                        <div key={index} className="flex gap-2">
                          <Input placeholder="Tool name..." value={tool} onChange={(e) => updateTool(index, e.target.value)} className="flex-1" />
                          {solutionForm.tools.length > 1 && (
                            <Button type="button" variant="secondary" size="sm" onClick={() => removeTool(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="secondary" onClick={() => setShowSolutionForm(false)} className="flex-1 transform hover:scale-105 transition-all">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitSolution} disabled={!solutionForm.content.trim() || isSubmitting} className="flex-1 transform hover:scale-105 transition-all">
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </span>
                      ) : "Submit Solution"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
