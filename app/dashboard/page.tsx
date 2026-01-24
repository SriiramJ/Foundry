"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solutions Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+23 from last week</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <Badge variant="default">Free</Badge>
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
            <div className="space-y-4">
              <div className="flex items-start space-x-3 animate-slide-in">
                <div className="w-2 h-2 bg-success rounded-full mt-2 animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium">New solution received</p>
                  <p className="text-xs text-helper">Marketing strategy for B2B SaaS</p>
                  <p className="text-xs text-helper">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 animate-slide-in" style={{animationDelay: '0.1s'}}>
                <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Problem posted</p>
                  <p className="text-xs text-helper">How to validate product-market fit?</p>
                  <p className="text-xs text-helper">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 animate-slide-in" style={{animationDelay: '0.2s'}}>
                <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Reputation increased</p>
                  <p className="text-xs text-helper">+15 points for helpful solution</p>
                  <p className="text-xs text-helper">3 days ago</p>
                </div>
              </div>
            </div>
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
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors animate-slide-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">How to validate product-market fit for B2B SaaS?</h3>
                  <p className="text-sm text-helper mt-1">Posted in Product Development • 1 day ago</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default">MVP Stage</Badge>
                    <span className="text-sm text-helper">3 solutions • 12 upvotes</span>
                  </div>
                </div>
                <Badge variant="verified" className="animate-pulse">Solved</Badge>
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">Best practices for hiring first engineering team?</h3>
                  <p className="text-sm text-helper mt-1">Posted in Hiring • 3 days ago</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="default">Early Stage</Badge>
                    <span className="text-sm text-helper">1 solution • 5 upvotes</span>
                  </div>
                </div>
                <Badge variant="default">Open</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}