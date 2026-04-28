"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Star, Calendar, ArrowLeft, Pencil, Camera, X, Check, Loader2 } from "lucide-react";

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({
  userData,
  onClose,
  onSaved,
}: {
  userData: any;
  onClose: () => void;
  onSaved: (updated: { name: string; email: string; image?: string }) => void;
}) {
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [avatar, setAvatar] = useState<string | null>(userData.image || null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError("Image must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
      setAvatarChanged(true);
      setError("");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }
    setSaving(true);
    setError("");
    try {
      // Update name + email
      const settingsRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!settingsRes.ok) {
        const d = await settingsRes.json();
        setError(d.error || "Failed to update profile.");
        setSaving(false);
        return;
      }

      // Update avatar if changed
      if (avatarChanged && avatar) {
        const avatarRes = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: avatar }),
        });
        if (!avatarRes.ok) {
          const d = await avatarRes.json();
          setError(d.error || "Failed to upload avatar.");
          setSaving(false);
          return;
        }
      }

      onSaved({ name: name.trim(), email: email.trim(), image: avatar || undefined });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-sans">Edit Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center border-2 border-border">
                {avatar ? (
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-accent">
                    {name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-accent hover:underline font-mono"
            >
              Change photo
            </button>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 font-mono">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button className="flex-1 transform hover:scale-105 transition-all" onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (session?.user) fetchUserData();
  }, [session]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user");
      if (!res.ok) throw new Error();
      setUserData(await res.json());
    } catch {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = (updated: { name: string; email: string; image?: string }) => {
    setUserData((prev: any) => ({ ...prev, ...updated }));
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
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

  const getLevelBadge = (rep: number) => {
    if (rep < 100) return <Badge variant="default">Beginner</Badge>;
    if (rep < 500) return <Badge variant="verified">Contributor</Badge>;
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
      {showEditModal && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSaved={handleSaved}
        />
      )}

      <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Your Profile</h1>
        <p className="text-body">Manage your profile and track your contributions to the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <Card className="card-hover">
            <CardHeader>
              <div className="flex items-center space-x-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center shrink-0 border-2 border-border">
                  {userData.image ? (
                    <img src={userData.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-accent">
                      {userData.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <CardTitle className="truncate">{userData.name}</CardTitle>
                  <CardDescription className="truncate">{userData.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between animate-fade-in">
                  <span className="text-sm font-medium">Role</span>
                  {getRoleBadge(userData.role)}
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <span className="text-sm font-medium">Level</span>
                  {getLevelBadge(userData.reputation || 0)}
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <span className="text-sm font-medium">Reputation</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-warning" />
                    <span className="font-medium">{userData.reputation}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <span className="text-sm font-medium">Member since</span>
                  <span className="text-sm text-helper">{new Date(userData.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Edit Profile Button */}
              <Button
                className="w-full mt-4 transform hover:scale-105 transition-all"
                variant="secondary"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>

              {userData.role !== "MENTOR" && !userData.mentorApplication && (
                <Link href="/apply-mentor">
                  <Button className="w-full mt-2 transform hover:scale-105 transition-all">
                    Apply to become a Mentor
                  </Button>
                </Link>
              )}

              {userData.mentorApplication && (
                <div className="mt-2 p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mentor Application</span>
                    <Badge variant={
                      userData.mentorApplication.status === "APPROVED" ? "verified" :
                      userData.mentorApplication.status === "REJECTED" ? "outline" :
                      userData.mentorApplication.status === "NEEDS_INFO" ? "premium" : "default"
                    }>
                      {userData.mentorApplication.status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                  </div>
                  <p className="text-xs text-helper">
                    Submitted on {new Date(userData.mentorApplication.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="mt-6 card-hover animate-scale-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center animate-fade-in">
                  <div className="text-2xl font-bold text-accent">{userData._count?.problems || 0}</div>
                  <p className="text-xs text-helper">Problems Posted</p>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  <div className="text-2xl font-bold text-success">{userData._count?.solutions || 0}</div>
                  <p className="text-xs text-helper">Solutions Provided</p>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  <div className="text-2xl font-bold text-warning">{userData.upvotesReceived || 0}</div>
                  <p className="text-xs text-helper">Upvotes Received</p>
                </div>
                <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
                  <div className="text-2xl font-bold text-success">{userData.verifiedSolutions || 0}</div>
                  <p className="text-xs text-helper">Verified Solutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Problems */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader>
              <CardTitle>Your Recent Problems</CardTitle>
              <CardDescription>Problems you've posted recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.problems?.length > 0 ? userData.problems.map((problem: any, index: number) => (
                  <Link key={problem.id} href={`/problems/${problem.id}`}>
                    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-all animate-slide-in cursor-pointer" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{problem.title}</h3>
                          <p className="text-sm text-helper mb-2">{problem._count?.solutions || 0} solutions</p>
                          <div className="flex items-center gap-2 text-xs text-helper">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge
                          variant={problem.isSolved ? "verified" : "default"}
                          className={`ml-4 shrink-0 ${problem.isSolved ? "animate-pulse" : ""}`}
                        >
                          {problem.isSolved ? "Solved" : "Open"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )) : (
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
