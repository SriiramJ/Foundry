"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Star, MessageSquare, CheckCircle, TrendingUp, Calendar, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  // Mock user data - in real app, this would come from API
  const userData = {
    name: session?.user?.name || "John Doe",
    email: session?.user?.email || "john@example.com",
    role: session?.user?.role || "BUILDER",
    reputation: 156,
    level: "Contributor",
    joinedDate: "2024-01-01",
    problemsPosted: 3,
    solutionsProvided: 8,
    upvotesReceived: 45,
    verifiedSolutions: 2
  };

  const recentActivity = [
    {
      type: "solution",
      title: "Provided solution for 'How to validate product-market fit?'",
      date: "2024-01-15",
      upvotes: 12
    },
    {
      type: "problem",
      title: "Posted 'Best practices for hiring first engineering team?'",
      date: "2024-01-12",
      responses: 5
    },
    {
      type: "upvote",
      title: "Received upvote on marketing strategy solution",
      date: "2024-01-10",
      upvotes: 1
    }
  ];

  const contributions = [
    {
      id: "1",
      title: "How to validate product-market fit for B2B SaaS?",
      type: "Problem",
      date: "2024-01-15",
      status: "Solved",
      engagement: "5 solutions, 23 upvotes"
    },
    {
      id: "2",
      title: "Marketing strategy for early-stage SaaS",
      type: "Solution",
      date: "2024-01-12",
      status: "Verified",
      engagement: "12 upvotes"
    },
    {
      id: "3",
      title: "Best practices for hiring first engineering team?",
      type: "Problem",
      date: "2024-01-10",
      status: "Open",
      engagement: "3 solutions, 8 upvotes"
    }
  ];

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "Beginner": return <Badge variant="default">{level}</Badge>;
      case "Contributor": return <Badge variant="verified">{level}</Badge>;
      case "Expert": return <Badge variant="premium">{level}</Badge>;
      default: return <Badge variant="default">{level}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "EXPLORER": return <Badge variant="default">Explorer</Badge>;
      case "BUILDER": return <Badge variant="verified">Builder</Badge>;
      case "MENTOR": return <Badge variant="premium">Mentor</Badge>;
      default: return <Badge variant="default">{role}</Badge>;
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <Button 
        variant="secondary" 
        onClick={() => router.back()}
        className="mb-6 transform hover:scale-105 transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Your Profile</h1>
        <p className="text-body">Manage your profile and track your contributions to the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 animate-scale-in" style={{animationDelay: '0.2s'}}>
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center transition-transform hover:scale-110">
                  <User className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>{userData.name}</CardTitle>
                  <CardDescription>{userData.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between animate-fade-in">
                  <span className="text-sm font-medium">Role</span>
                  {getRoleBadge(userData.role)}
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <span className="text-sm font-medium">Level</span>
                  {getLevelBadge(userData.level)}
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <span className="text-sm font-medium">Reputation</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning transition-transform hover:scale-110" />
                    <span className="font-medium">{userData.reputation}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <span className="text-sm font-medium">Member since</span>
                  <span className="text-sm text-helper">
                    {new Date(userData.joinedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button className="w-full mt-4 transform hover:scale-105 transition-all" variant="secondary">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="mt-6 card-hover animate-scale-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center animate-fade-in">
                  <div className="text-2xl font-bold text-accent">{userData.problemsPosted}</div>
                  <p className="text-xs text-helper">Problems Posted</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="text-2xl font-bold text-success">{userData.solutionsProvided}</div>
                  <p className="text-xs text-helper">Solutions Provided</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="text-2xl font-bold text-warning">{userData.upvotesReceived}</div>
                  <p className="text-xs text-helper">Upvotes Received</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="text-2xl font-bold text-success">{userData.verifiedSolutions}</div>
                  <p className="text-xs text-helper">Verified Solutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
          {/* Recent Activity */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest contributions and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 pb-4 border-b border-border last:border-b-0 animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-helper">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        {activity.upvotes && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-success" />
                            <span className="text-xs text-helper">{activity.upvotes} upvotes</span>
                          </div>
                        )}
                        {activity.responses && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3 text-accent" />
                            <span className="text-xs text-helper">{activity.responses} responses</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contributions */}
          <Card className="card-hover animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle>Your Contributions</CardTitle>
              <CardDescription>Problems you&apos;ve posted and solutions you&apos;ve provided</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributions.map((contribution, index) => (
                  <div key={contribution.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-all animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{contribution.title}</h3>
                          <Badge variant="default" className="text-xs">
                            {contribution.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-helper mb-2">{contribution.engagement}</p>
                        <div className="flex items-center gap-2 text-xs text-helper">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(contribution.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={contribution.status === "Solved" || contribution.status === "Verified" ? "verified" : "default"}
                        className={`ml-4 ${contribution.status === "Solved" || contribution.status === "Verified" ? "animate-pulse" : ""}`}
                      >
                        {contribution.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}