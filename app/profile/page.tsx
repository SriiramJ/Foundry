"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Star, MessageSquare, CheckCircle, TrendingUp, Calendar, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 animate-fade-in">
        <p className="text-helper text-center">Failed to load profile data</p>
      </div>
    );
  }

  const getLevelBadge = (reputation: number) => {
    if (reputation < 100) return <Badge variant="default">Beginner</Badge>;
    if (reputation < 500) return <Badge variant="verified">Contributor</Badge>;
    return <Badge variant="premium">Expert</Badge>;
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
                  {getLevelBadge(userData.reputation || 0)}
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
                    {new Date(userData.createdAt).toLocaleDateString()}
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
                  <div className="text-2xl font-bold text-accent">{userData._count?.problems || 0}</div>
                  <p className="text-xs text-helper">Problems Posted</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                  <div className="text-2xl font-bold text-success">{userData._count?.solutions || 0}</div>
                  <p className="text-xs text-helper">Solutions Provided</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                  <div className="text-2xl font-bold text-warning">{userData.upvotesReceived || 0}</div>
                  <p className="text-xs text-helper">Upvotes Received</p>
                </div>
                <div className="text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                  <div className="text-2xl font-bold text-success">{userData.verifiedSolutions || 0}</div>
                  <p className="text-xs text-helper">Verified Solutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
          {/* Recent Problems */}
          <Card className="card-hover animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle>Your Recent Problems</CardTitle>
              <CardDescription>Problems you've posted recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.problems?.map((problem: any, index: number) => (
                  <div key={problem.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-all animate-slide-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{problem.title}</h3>
                          <Badge variant="default" className="text-xs">
                            Problem
                          </Badge>
                        </div>
                        <p className="text-sm text-helper mb-2">{problem._count?.solutions || 0} solutions</p>
                        <div className="flex items-center gap-2 text-xs text-helper">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={problem.isSolved ? "verified" : "default"}
                        className={`ml-4 ${problem.isSolved ? "animate-pulse" : ""}`}
                      >
                        {problem.isSolved ? "Solved" : "Open"}
                      </Badge>
                    </div>
                  </div>
                )) || (
                  <p className="text-helper text-center">No problems posted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}