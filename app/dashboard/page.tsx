"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, MessageSquare, CheckCircle, TrendingUp, Star, Crown, Calendar } from "lucide-react";

function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activity');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-premium';
      default: return 'bg-accent';
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-4">
      {activities.length > 0 ? activities.map((activity: any, index: number) => (
        <div key={index} className="flex items-start space-x-3 animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
          <div className={`w-2 h-2 ${getStatusColor(activity.status)} rounded-full mt-2 ${activity.status === 'success' ? 'animate-pulse' : ''}`}></div>
          <div>
            <p className="text-sm font-medium font-mono">{activity.title}</p>
            <p className="text-xs text-helper font-mono">{activity.description}</p>
            <p className="text-xs text-helper font-mono">{formatTimeAgo(activity.time)}</p>
          </div>
        </div>
      )) : (
        <p className="text-helper text-center font-mono">No recent activity</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentProblems, setRecentProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
      fetchRecentProblems();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchRecentProblems = async () => {
    try {
      const response = await fetch('/api/problems');
      if (response.ok) {
        const data = await response.json();
        setRecentProblems(data.slice(0, 2));
      }
    } catch (error) {
      console.error('Failed to fetch recent problems:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2 font-mono">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 animate-fade-in">
      <div className="mb-6 sm:mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Welcome back, {session?.user?.name}</h1>
        <p className="text-body">
          {dashboardData?.role === "MENTOR"
            ? "Here's an overview of your mentoring activity."
            : "Here's what's happening in your entrepreneurial journey."}
        </p>
      </div>

      {/* Responsive Layout */}
      <div className="space-y-6 lg:grid lg:grid-cols-12 lg:gap-8 lg:space-y-0 mb-8">
        {/* Stats Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 stagger-children">
            {dashboardData?.role === "MENTOR" ? (
              <>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Solutions Given</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.solutionsReceived || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.weeklyChanges?.solutions > 0 ? "+" : ""}{dashboardData?.weeklyChanges?.solutions || 0} from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Reputation Points</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.reputation || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.weeklyChanges?.reputation > 0 ? "+" : ""}{dashboardData?.weeklyChanges?.reputation || 0} from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Sessions</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.pendingSessions || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Messages</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.problemsPosted || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total conversations</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Problems Posted</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.problemsPosted || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.weeklyChanges?.problems > 0 ? "+" : ""}{dashboardData?.weeklyChanges?.problems || 0} from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Solutions Received</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.solutionsReceived || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.weeklyChanges?.solutions > 0 ? "+" : ""}{dashboardData?.weeklyChanges?.solutions || 0} from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Reputation Points</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl font-bold text-foreground">{dashboardData?.reputation || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dashboardData?.weeklyChanges?.reputation > 0 ? "+" : ""}{dashboardData?.weeklyChanges?.reputation || 0} from last week
                    </p>
                  </CardContent>
                </Card>
                <Card className="problem-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
                      {dashboardData?.subscription?.status === "active" ? (
                        <Crown className="h-4 w-4 text-warning" />
                      ) : (
                        <Star className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {dashboardData?.subscription?.status === "active" ? (
                      <>
                        <div className="text-2xl font-bold text-foreground capitalize">
                          {dashboardData.subscription.plan.charAt(0) + dashboardData.subscription.plan.slice(1).toLowerCase()}
                        </div>
                        {dashboardData.subscription.endDate && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires {new Date(dashboardData.subscription.endDate).toLocaleDateString()}
                          </p>
                        )}
                        <Link href="/upgrade" className="block mt-2">
                          <Button variant="outline" className="text-xs w-full border-border hover:border-accent/30">Manage Plan</Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-foreground">Free</div>
                        <p className="text-xs text-muted-foreground mt-1">Upgrade for more features</p>
                        <Link href="/upgrade" className="block mt-2">
                          <Button className="btn-premium text-xs w-full">Upgrade</Button>
                        </Link>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Problems */}
          <Card className="problem-card animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="font-sans">Your Recent Problems</CardTitle>
              <CardDescription className="font-mono">Problems you've posted recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProblems.map((problem: any, index: number) => (
                  <Link key={problem.id} href={`/problems/${problem.id}`}>
                  <div className="border border-border p-4 hover:bg-muted/50 transition-colors animate-slide-in cursor-pointer" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium font-sans hover:text-accent transition-colors">{problem.title}</h3>
                        <p className="text-sm text-helper mt-1 font-mono">Posted in {problem.category} • {new Date(problem.createdAt).toLocaleDateString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="tag-system">{problem.stage}</span>
                          <span className="text-sm text-helper font-mono">{problem._count?.solutions || 0} solutions</span>
                        </div>
                      </div>
                      <Badge className={problem.isSolved ? "verified-solution" : "tag-system"}>
                        {problem.isSolved ? "Solved" : "Open"}
                      </Badge>
                    </div>
                  </div>
                  </Link>
                ))}
                {recentProblems.length === 0 && (
                  <p className="text-helper text-center font-mono">No problems posted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - User Quick-Stats & Actions */}
        <div className="lg:col-span-4 space-y-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <Card className="problem-card">
            <CardHeader>
              <CardTitle className="font-sans">Quick Actions</CardTitle>
              <CardDescription className="font-mono">Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 p-6">
              {dashboardData?.role === "MENTOR" ? (
                <>
                  <Link href="/knowledge-base" className="block">
                    <Button className="w-full justify-start btn-primary transform hover:scale-105 transition-all font-mono">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Browse Problems to Solve
                    </Button>
                  </Link>
                  <Link href="/mentor-sessions" className="block">
                    <Button variant="outline" className="w-full justify-start transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Session Requests
                    </Button>
                  </Link>
                  <Link href="/messages" className="block">
                    <Button variant="outline" className="w-full justify-start transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/post-problem" className="block">
                    <Button className="w-full justify-start btn-primary transform hover:scale-105 transition-all font-mono">
                      <Plus className="mr-2 h-4 w-4" />
                      Post a New Problem
                    </Button>
                  </Link>
                  <Link href="/knowledge-base" className="block">
                    <Button variant="outline" className="w-full justify-start transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Browse Knowledge Base
                    </Button>
                  </Link>
                  <Link href="/mentors" className="block">
                    <Button variant="outline" className="w-full justify-start transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Find Mentors
                    </Button>
                  </Link>
                  {dashboardData?.role !== "MENTOR" && !dashboardData?.mentorApplication && (
                    <Link href="/apply-mentor" className="block">
                      <Button variant="outline" className="w-full justify-start transform hover:scale-105 transition-all font-mono border-border hover:border-accent/30">
                        <Star className="mr-2 h-4 w-4" />
                        Apply to become a Mentor
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="problem-card">
            <CardHeader>
              <CardTitle className="font-sans">Recent Activity</CardTitle>
              <CardDescription className="font-mono">Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}