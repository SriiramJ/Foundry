"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, X, AlertCircle, Clock, User, Users, Crown, Search } from "lucide-react";

// ── Mentor Applications Tab ───────────────────────────────────────────────────
function MentorApplicationsTab() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/mentor-applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId: string, status: string, reviewNotes?: string) => {
    try {
      const res = await fetch("/api/admin/mentor-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status, reviewNotes }),
      });
      if (res.ok) {
        fetchApplications();
        alert("Application updated successfully");
      } else {
        alert("Failed to update application");
      }
    } catch {
      alert("Error updating application");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return <Badge variant="verified">Approved</Badge>;
      case "REJECTED": return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      case "NEEDS_INFO": return <Badge variant="premium">Needs Info</Badge>;
      default: return <Badge variant="default">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="text-helper mt-2">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {applications.map((app: any, index: number) => (
        <Card key={app.id} className="card-hover animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>{app.fullName}</CardTitle>
                  <CardDescription>{app.user.email}</CardDescription>
                </div>
              </div>
              {getStatusBadge(app.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1">Expertise</h4>
                  <p className="text-helper">{app.expertise}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Experience</h4>
                  <p className="text-helper">{app.experience} years</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-1">Background</h4>
                <p className="text-helper">{app.background}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Proof of Work</h4>
                <a href={app.proofOfWork} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  {app.proofOfWork}
                </a>
              </div>
              <div className="text-sm text-helper">
                Applied on {new Date(app.createdAt).toLocaleDateString()}
              </div>
              {app.status === "PENDING" && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleReview(app.id, "APPROVED")} className="flex-1 bg-success hover:bg-success/80">
                    <CheckCircle className="mr-2 h-4 w-4" />Approve
                  </Button>
                  <Button onClick={() => handleReview(app.id, "NEEDS_INFO", "Please provide more information")} variant="secondary" className="flex-1">
                    <AlertCircle className="mr-2 h-4 w-4" />Need Info
                  </Button>
                  <Button onClick={() => handleReview(app.id, "REJECTED", "Application does not meet requirements")} variant="outline" className="flex-1 text-red-600 border-red-600 hover:bg-red-50">
                    <X className="mr-2 h-4 w-4" />Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {applications.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-helper mx-auto mb-4" />
          <p className="text-helper">No mentor applications found</p>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        const data = await res.json();
        setError(data.error || `Error ${res.status}`);
      }
    } catch (err) {
      setError("Network error — could not load users.");
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePremium = async (userId: string, currentIsPremium: boolean) => {
    setTogglingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPremium: !currentIsPremium }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, isPremium: !currentIsPremium } : u)
        );
      } else {
        alert("Failed to update user");
      }
    } catch {
      alert("Error updating user");
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="text-helper mt-2">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Users className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium">Failed to load users</p>
        <p className="text-helper text-sm mt-1">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => { setError(null); setLoading(true); fetchUsers(); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="problem-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-helper font-mono">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="problem-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-helper font-mono">Premium Users</p>
            <p className="text-2xl font-bold text-accent">{users.filter((u) => u.isPremium).length}</p>
          </CardContent>
        </Card>
        <Card className="problem-card">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-helper font-mono">Mentors</p>
            <p className="text-2xl font-bold text-warning">{users.filter((u) => u.role === "MENTOR").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card className="problem-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Premium Access</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: any, index: number) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.name || "—"}</p>
                          <p className="text-xs text-helper truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === "MENTOR" ? "premium" : "default"} className="text-xs">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {user.isPremium ? (
                        <div className="flex items-center gap-1 text-accent">
                          <Crown className="h-4 w-4" />
                          <span className="text-xs font-medium font-mono">
                            {user.subscription?.plan || "PREMIUM"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-helper font-mono">Free</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-helper font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        variant={user.isPremium ? "outline" : "default"}
                        onClick={() => handleTogglePremium(user.id, user.isPremium)}
                        disabled={togglingId === user.id}
                        className="transform hover:scale-105 transition-all text-xs"
                      >
                        {togglingId === user.id ? (
                          <span className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                            Updating...
                          </span>
                        ) : user.isPremium ? (
                          <span className="flex items-center gap-1"><X className="h-3 w-3" />Revoke Premium</span>
                        ) : (
                          <span className="flex items-center gap-1"><Crown className="h-3 w-3" />Grant Premium</span>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-10 w-10 text-helper mx-auto mb-3" />
                <p className="text-helper">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "users">("applications");

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Admin Panel</h1>
        <p className="text-body">Manage mentor applications and user subscriptions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab("applications")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "applications"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" />
          Mentor Applications
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "users"
              ? "border-accent text-accent"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
      </div>

      {activeTab === "applications" ? <MentorApplicationsTab /> : <UsersTab />}
    </div>
  );
}
