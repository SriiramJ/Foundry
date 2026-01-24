"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";

function RecentActivity() {
  const [activities, setActivities] = useState([]);
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
      case 'warning': return 'bg-warning';
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
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-helper">{activity.description}</p>
            <p className="text-xs text-helper">{formatTimeAgo(activity.time)}</p>
          </div>
        </div>
      )) : (
        <p className="text-helper text-center">No recent activity</p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentProblems, setRecentProblems] = useState([]);
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
          <p className="text-helper mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Welcome back, {session?.user?.name}</h1>
        <p className="text-body">Here&apos;s what&apos;s happening in your entrepreneurial journey.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 stagger-children">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Posted</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.problemsPosted || 0}</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solutions Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.solutionsReceived || 0}</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.reputation || 0}</div>
            <p className="text-xs text-muted-foreground">+23 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Badge variant="default">{dashboardData?.isPremium ? 'Premium' : 'Free'}</Badge>
          </CardHeader>
          <CardContent>
            <Link href="/upgrade">
              <Button variant="secondary" size="sm" className="transform hover:scale-105 transition-transform">Upgrade</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.3s'}}>
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <Link href="/post-problem" className="block">
              <Button className="w-full justify-start transform hover:scale-105 transition-all" variant="secondary">
                <Plus className="mr-2 h-4 w-4" />
                Post a New Problem
              </Button>
            </Link>
            <Link href="/knowledge-base" className="block">
              <Button className="w-full justify-start transform hover:scale-105 transition-all" variant="secondary">
                <MessageSquare className="mr-2 h-4 w-4" />
                Browse Knowledge Base
              </Button>
            </Link>
            <Link href="/mentors" className="block">
              <Button className="w-full justify-start transform hover:scale-105 transition-all" variant="secondary">
                <CheckCircle className="mr-2 h-4 w-4" />
                Find Mentors
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Recent Problems */}
      <Card className="card-hover animate-fade-in" style={{animationDelay: '0.5s'}}>
        <CardHeader>
          <CardTitle>Your Recent Problems</CardTitle>
          <CardDescription>Problems you&apos;ve posted recently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProblems.map((problem: any, index: number) => (
              <div key={problem.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{problem.title}</h3>
                    <p className="text-sm text-helper mt-1">Posted in {problem.category} • {new Date(problem.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{problem.stage}</Badge>
                      <span className="text-sm text-helper">{problem._count?.solutions || 0} solutions</span>
                    </div>
                  </div>
                  <Badge variant={problem.isSolved ? "verified" : "default"} className={problem.isSolved ? "animate-pulse" : ""}>
                    {problem.isSolved ? "Solved" : "Open"}
                  </Badge>
                </div>
              </div>
            ))}
            {recentProblems.length === 0 && (
              <p className="text-helper text-center">No problems posted yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}