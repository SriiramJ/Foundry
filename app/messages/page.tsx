"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

function MessagesContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  // Mobile: track which panel is visible — "list" or "chat"
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    const mentorId = searchParams.get("mentorId");
    const mentorName = searchParams.get("mentorName");
    if (mentorId && mentorName) {
      openConversation({ id: mentorId, name: mentorName, role: "MENTOR" });
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!activeConversation) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${activeConversation.id}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(prev =>
            data.messages.length !== prev.length ? data.messages : prev
          );
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) setConversations(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const openConversation = async (user: any) => {
    setActiveConversation(user);
    setMobileView("chat");
    try {
      const res = await fetch(`/api/messages/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
        fetchConversations();
      }
    } catch {}
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeConversation.id, content: newMessage })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMessage("");
        fetchConversations();
      }
    } catch {}
    finally { setIsSending(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) {
    return (
      <div className="p-6 text-center animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
        <p className="text-helper mt-2">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      {/* Header — only show on desktop or mobile list view */}
      {(mobileView === "list") && (
        <div className="mb-4 md:mb-6">
          <Button variant="secondary" onClick={() => router.back()} className="mb-4 transform hover:scale-105 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
          <h1 className="text-h1 mb-1">Messages</h1>
          <p className="text-body">Your conversations with mentors.</p>
        </div>
      )}

      {/* Desktop: side-by-side | Mobile: single panel at a time */}
      <div className="md:grid md:grid-cols-3 md:gap-6 md:h-[600px]">

        {/* Conversations List — hidden on mobile when chat is open */}
        <div className={`md:col-span-1 md:block ${mobileView === "chat" ? "hidden" : "block"}`}>
          <Card className="h-full overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-helper">No conversations yet.</p>
                  <p className="text-xs text-helper mt-1">Go to Mentors and click Ask Question.</p>
                </div>
              ) : (
                conversations.map((conv: any) => (
                  <button
                    key={conv.user.id}
                    onClick={() => openConversation(conv.user)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b border-border ${
                      activeConversation?.id === conv.user.id ? "bg-muted/50 border-l-2 border-l-accent" : ""
                    }`}
                  >
                    <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate">{conv.user.name}</span>
                        {conv.unreadCount > 0 && (
                          <Badge className="text-xs ml-1 bg-accent text-accent-foreground">{conv.unreadCount}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-helper truncate">
                        {conv.messages[conv.messages.length - 1]?.content || ""}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Window — hidden on mobile when list is shown */}
        <div className={`md:col-span-2 md:block ${mobileView === "list" ? "hidden" : "block"}`}>
          <Card className="flex flex-col h-[calc(100vh-12rem)] md:h-full overflow-hidden">
            {!activeConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-helper">Select a conversation or ask a mentor a question.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header with back button on mobile */}
                <CardHeader className="pb-3 border-b border-border flex-shrink-0">
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={() => { setMobileView("list"); setActiveConversation(null); setMessages([]); }}
                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">{activeConversation.name}</CardTitle>
                      <Badge variant="default" className="text-xs">{activeConversation.role}</Badge>
                    </div>
                    <button
                      onClick={() => { setMobileView("list"); setActiveConversation(null); setMessages([]); }}
                      className="p-1 rounded-lg hover:bg-muted transition-colors ml-auto"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-center text-helper text-sm">No messages yet. Say hello!</p>
                  )}
                  {messages.map((msg: any) => {
                    const isMine = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] md:max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          isMine
                            ? "bg-accent text-accent-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMine ? "text-accent-foreground/70" : "text-helper"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="p-4 border-t border-border flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim() || isSending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div></div>}>
      <MessagesContent />
    </Suspense>
  );
}
