"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Star, CheckCircle, MessageCircle, User,
  Calendar, Clock, ThumbsUp, Shield, Briefcase, Video, X, Crown, Lock
} from "lucide-react";
import Link from "next/link";

function BookSessionModal({ mentor, onClose, onBooked }: { mentor: any; onClose: () => void; onBooked: () => void }) {
  const [form, setForm] = useState({ topic: "", description: "", scheduledAt: "", duration: 60 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const minDate = (() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.scheduledAt) { setError("Topic and date/time are required."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/mentor-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor.id,
          topic: form.topic,
          description: form.description || undefined,
          scheduledAt: new Date(form.scheduledAt).toISOString(),
          duration: form.duration,
        }),
      });
      const data = await res.json();
      if (res.ok) onBooked();
      else setError(data.error || "Failed to book session.");
    } catch { setError("Something went wrong."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-background border border-border rounded-xl w-full max-w-md shadow-2xl animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold font-sans">Book a Session with {mentor.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Topic <span className="text-red-400">*</span></label>
            <Input
              placeholder="e.g. Fundraising strategy for seed round"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              maxLength={100}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description <span className="text-helper text-xs">(optional)</span></label>
            <textarea
              rows={3}
              placeholder="What would you like to discuss?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 text-sm border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent bg-background transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date & Time <span className="text-red-400">*</span></label>
              <input
                type="datetime-local"
                min={minDate}
                value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full p-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={30}>30 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400 font-mono">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" className="flex-1 transform hover:scale-105 transition-all" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />Booking...
                </span>
              ) : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MentorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isSelfMentor, setIsSelfMentor] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/mentors/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setMentor(data))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/user")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        const sub = data.subscription;
        const proActive =
          sub?.plan === "PRO" &&
          sub?.status === "active" &&
          (!sub.endDate || new Date(sub.endDate) > new Date());
        setIsPro(proActive);
        setIsSelfMentor(data.role === "MENTOR");
      })
      .catch(() => {});
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
      {showBookModal && (
        <BookSessionModal
          mentor={mentor}
          onClose={() => setShowBookModal(false)}
          onBooked={() => { setShowBookModal(false); setBookingSuccess(true); }}
        />
      )}

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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/messages?mentorId=${mentor.id}&mentorName=${encodeURIComponent(mentor.name)}`)}
                  className="transform hover:scale-105 transition-all"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask a Question
                </Button>
                {(isPro || isSelfMentor) ? (
                  <Button
                    onClick={() => { setBookingSuccess(false); setShowBookModal(true); }}
                    className="transform hover:scale-105 transition-all"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Book Session
                  </Button>
                ) : (
                  <Link href="/upgrade">
                    <Button variant="outline" className="transform hover:scale-105 transition-all border-accent/30">
                      <Lock className="mr-2 h-4 w-4" />
                      <Crown className="mr-1 h-3 w-3 text-warning" />
                      Pro: Book Session
                    </Button>
                  </Link>
                )}
              </div>
              {bookingSuccess && (
                <p className="text-sm text-success font-mono mt-3 flex items-center gap-1 animate-fade-in">
                  <CheckCircle className="h-4 w-4" /> Session booked! View it in{" "}
                  <Link href="/mentor-sessions" className="underline">My Sessions</Link>.
                </p>
              )}
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
