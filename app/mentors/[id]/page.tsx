"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Star, CheckCircle, MessageCircle, User,
  Calendar, Clock, ThumbsUp, Shield, Briefcase
} from "lucide-react";
import Link from "next/link";

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mentors/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setMentor(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        <p className="text-helper mt-2">Loading profile...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="p-6 animate-fade-in">
        <Button variant="secondary" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        <p className="text-helper text-center">Mentor not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      {/* Header Card */}
      <Card className="mb-6 card-hover animate-scale-in">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-h2 font-bold">{mentor.name}</h1>
                {mentor.isVerified && <Badge variant="verified">Verified</Badge>}
                {mentor.isPremium && <Badge variant="premium">Premium</Badge>}
              </div>
              <p className="text-helper mb-3">{mentor.title}</p>
              <p className="text-body mb-4">{mentor.bio}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertise.map((skill: string) => (
                  <Badge key={skill} variant="default" className="text-xs">{skill}</Badge>
                ))}
              </div>
              <Button
                onClick={() => router.push(`/messages?mentorId=${mentor.id}&mentorName=${encodeURIComponent(mentor.name)}`)}
                className="transform hover:scale-105 transition-all"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask a Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 stagger-children">
        <Card className="card-hover animate-scale-in">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 text-warning fill-current" />
              <span className="text-2xl font-bold">{mentor.rating}</span>
            </div>
            <p className="text-xs text-helper">Rating</p>
          </CardContent>
        </Card>
        <Card className="card-hover animate-scale-in">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold mb-1">{mentor.solutionsCount}</div>
            <p className="text-xs text-helper">Solutions</p>
          </CardContent>
        </Card>
        <Card className="card-hover animate-scale-in">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold mb-1">{mentor.reputation}</div>
            <p className="text-xs text-helper">Reputation</p>
          </CardContent>
        </Card>
        <Card className="card-hover animate-scale-in">
          <CardContent className="pt-4 pb-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold">{mentor.responseTime}</span>
            </div>
            <p className="text-xs text-helper">Response Time</p>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card className="mb-6 card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-helper" />
            <span className="text-helper">Member since</span>
            <span className="font-medium">{new Date(mentor.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-helper" />
            <span className="text-helper">Status</span>
            <span className="font-medium">{mentor.isVerified ? "Verified Mentor" : "Mentor"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-helper" />
            <span className="text-helper">Expertise</span>
            <span className="font-medium">{mentor.expertise.join(", ")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Solutions */}
      <Card className="card-hover animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Solutions
          </CardTitle>
          <CardDescription>{mentor.solutionsCount} total solutions provided</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mentor.recentSolutions.length === 0 ? (
            <p className="text-helper text-center py-4">No solutions yet.</p>
          ) : (
            mentor.recentSolutions.map((solution: any, index: number) => (
              <div key={solution.id} className="border border-border rounded-lg p-4 animate-slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/problems/${solution.problem?.id}`}>
                    <p className="text-sm font-medium hover:text-accent transition-colors cursor-pointer">
                      {solution.problem?.title || "Unknown Problem"}
                    </p>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {solution.isVerified && <Badge variant="verified" className="text-xs">Verified</Badge>}
                    <div className="flex items-center gap-1 text-xs text-helper">
                      <ThumbsUp className="h-3 w-3" />
                      {solution.upvotes}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-helper line-clamp-2">{solution.content}</p>
                <p className="text-xs text-helper mt-2">{new Date(solution.createdAt).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
