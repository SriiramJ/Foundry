"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Trash2, User, ChevronDown, ChevronUp } from "lucide-react";

interface CommentSectionProps {
  problemId?: string;
  solutionId?: string;
  initialCount?: number;
}

export function CommentSection({ problemId, solutionId, initialCount = 0 }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [count, setCount] = useState(initialCount);

  const queryParam = problemId ? `problemId=${problemId}` : `solutionId=${solutionId}`;

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments?${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
        setCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) fetchComments();
  }, [isExpanded]);

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          ...(problemId ? { problemId } : { solutionId })
        })
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
        setCount(prev => prev + 1);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTimeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="mt-4 border-t border-border pt-4">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-helper hover:text-foreground transition-colors w-full text-left"
      >
        <MessageSquare className="h-4 w-4" />
        <span>{count} {count === 1 ? "comment" : "comments"}</span>
        {isExpanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-helper py-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-accent"></div>
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-helper py-2">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 animate-slide-in">
                <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <Badge variant="default" className="text-xs py-0">{comment.author.role}</Badge>
                    <span className="text-xs text-helper">{formatTimeAgo(comment.createdAt)}</span>
                    {comment.author.id === session?.user?.id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="ml-auto text-helper hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground break-words">{comment.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Comment Input */}
          {session?.user && (
            <div className="flex gap-2 pt-1">
              <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-accent-foreground" />
              </div>
              <div className="flex-1 flex gap-2">
                <textarea
                  rows={1}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm p-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-accent bg-background transition-all"
                />
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isSubmitting}
                  className="self-end transform hover:scale-105 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
