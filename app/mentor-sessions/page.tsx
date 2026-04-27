"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ArrowLeft, Calendar, Clock, User, CheckCircle, X,
  Video, Crown, Lock, ExternalLink, Plus,
} from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/30",
  CONFIRMED: "bg-success/10 text-success border-success/30",
  COMPLETED: "bg-accent/10 text-accent border-accent/30",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

function SessionCard({
  session: s,
  role,
  onAction,
}: {
  session: any;
  role: "mentor" | "learner";
  onAction: () => void;
}) {
  const [meetLink, setMeetLink] = useState(s.meetLink || "");
  const [updating, setUpdating] = useState(false);

  const update = async (payload: object) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/mentor-sessions/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) onAction();
      else {
        const d = await res.json();
        alert(d.error || "Failed to update session");
      }
    } catch { alert("Something went wrong"); }
    finally { setUpdating(false); }
  };

  const isPast = new Date(s.scheduledAt) < new Date();

  return (
    <Card className="problem-card animate-scale-in">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium font-sans truncate">{s.topic}</p>
            {s.description && (
              <p className="text-xs text-helper font-mono mt-0.5 line-clamp-2">{s.description}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border font-mono flex-shrink-0 ${STATUS_STYLES[s.status]}`}>
            {s.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-helper font-mono mb-3">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {role === "mentor" ? `Learner: ${s.learner?.name}` : `Mentor: ${s.mentor?.name}`}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(s.scheduledAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(s.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {s.duration} min
          </span>
        </div>

        {/* Meet link */}
        {s.meetLink && (
          <a
            href={s.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-accent hover:underline font-mono mb-3"
          >
            <Video className="h-3.5 w-3.5" />
            Join Meeting
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Mentor actions */}
        {role === "mentor" && s.status === "PENDING" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add Google Meet / Zoom link..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="flex-1 text-xs font-mono h-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs"
                disabled={updating}
                onClick={() => update({ status: "CONFIRMED", meetLink: meetLink || undefined })}
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1" />Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs text-red-500 border-red-300"
                disabled={updating}
                onClick={() => update({ status: "CANCELLED" })}
              >
                <X className="h-3.5 w-3.5 mr-1" />Decline
              </Button>
            </div>
          </div>
        )}

        {role === "mentor" && s.status === "CONFIRMED" && isPast && (
          <Button
            size="sm"
            className="w-full text-xs"
            disabled={updating}
            onClick={() => update({ status: "COMPLETED" })}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />Mark as Completed
          </Button>
        )}

        {/* Learner cancel */}
        {role === "learner" && (s.status === "PENDING" || s.status === "CONFIRMED") && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs text-red-500 border-red-300"
            disabled={updating}
            onClick={() => update({ status: "CANCELLED" })}
          >
            <X className="h-3.5 w-3.5 mr-1" />Cancel Session
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function MentorSessionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any>({ asMentor: [], asLearner: [] });
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [tab, setTab] = useState<"booked" | "incoming">("booked");

  useEffect(() => {
    if (session?.user) {
      fetchSessions();
      checkAccess();
    }
  }, [session]);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/mentor-sessions");
      if (res.ok) setSessions(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const checkAccess = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        const sub = data.subscription;
        const proActive =
          sub?.plan === "PRO" &&
          sub?.status === "active" &&
          (!sub.endDate || new Date(sub.endDate) > new Date());
        setIsPro(proActive);
        setIsMentor(data.role === "MENTOR");
      }
    } catch {}
  };

  const canBook = isPro || isMentor;

  if (loading) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto" />
        <p className="text-helper mt-2 font-mono">Loading sessions...</p>
      </div>
    );
  }

  const bookedSessions = sessions.asLearner;
  const incomingSessions = sessions.asMentor;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <Button variant="secondary" onClick={() => router.back()} className="mb-4 transform hover:scale-105 transition-all">
        <ArrowLeft className="mr-2 h-4 w-4" />Back
      </Button>

      <div className="flex items-start justify-between mb-6 animate-slide-in">
        <div>
          <h1 className="text-h1 mb-1">Mentor Sessions</h1>
          <p className="text-body">1-on-1 sessions with experienced mentors.</p>
        </div>
        {canBook && (
          <Link href="/mentors">
            <Button className="transform hover:scale-105 transition-all">
              <Plus className="mr-2 h-4 w-4" />Book Session
            </Button>
          </Link>
        )}
      </div>

      {/* Pro gate */}
      {!canBook && (
        <Card className="mb-6 border-accent/30 animate-scale-in">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="h-7 w-7 text-accent" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-semibold flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Crown className="h-4 w-4 text-warning" />Pro Plan Required
                </h2>
                <p className="text-sm text-helper font-mono">
                  Upgrade to the Pro plan to book 1-on-1 mentor sessions. Get personalised guidance from experienced entrepreneurs.
                </p>
              </div>
              <Link href="/upgrade" className="flex-shrink-0">
                <Button className="btn-premium transform hover:scale-105 transition-all">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs — only show incoming tab for mentors */}
      {isMentor && (
        <div className="flex gap-1 mb-6 border-b border-border">
          <button
            onClick={() => setTab("booked")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "booked" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            My Bookings
            {bookedSessions.length > 0 && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full font-mono">{bookedSessions.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("incoming")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === "incoming" ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            Incoming Requests
            {incomingSessions.filter((s: any) => s.status === "PENDING").length > 0 && (
              <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-mono">
                {incomingSessions.filter((s: any) => s.status === "PENDING").length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Booked sessions (as learner) */}
      {(!isMentor || tab === "booked") && (
        <div className="space-y-4">
          {bookedSessions.length === 0 ? (
            <Card className="problem-card animate-fade-in">
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No sessions booked yet</p>
                <p className="text-sm text-helper font-mono mb-4">
                  {canBook ? "Browse mentors and book your first 1-on-1 session." : "Upgrade to Pro to book sessions."}
                </p>
                {canBook && (
                  <Link href="/mentors">
                    <Button className="transform hover:scale-105 transition-all">Browse Mentors</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            bookedSessions.map((s: any) => (
              <SessionCard key={s.id} session={s} role="learner" onAction={fetchSessions} />
            ))
          )}
        </div>
      )}

      {/* Incoming requests (as mentor) */}
      {isMentor && tab === "incoming" && (
        <div className="space-y-4">
          {incomingSessions.length === 0 ? (
            <Card className="problem-card animate-fade-in">
              <CardContent className="py-12 text-center">
                <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">No session requests yet</p>
                <p className="text-sm text-helper font-mono">
                  When learners book sessions with you, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            incomingSessions.map((s: any) => (
              <SessionCard key={s.id} session={s} role="mentor" onAction={fetchSessions} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
