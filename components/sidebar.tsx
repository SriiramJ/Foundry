"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Plus,
  BookOpen,
  Users,
  Settings,
  Shield,
  MessageCircle,
  BarChart2,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Post Problem", href: "/post-problem", icon: Plus },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (session?.user) {
      fetchUnreadCount();
      fetchAvatar();
    }
  }, [session, pathname]);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const convs = await res.json();
        const total = convs.reduce((sum: number, c: any) => sum + c.unreadCount, 0);
        setUnreadCount(total);
      }
    } catch {}
  };

  const fetchAvatar = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        if (data.image) setAvatar(data.image);
      }
    } catch {}
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch("/api/user", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        if (res.ok) {
          setAvatar(base64);
        } else {
          const data = await res.json();
          alert(data.error || "Failed to upload avatar.");
        }
      } catch {
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background animate-slide-in overflow-hidden">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <Link
          href="/"
          className="text-h3 font-bold text-accent hover:text-accent/80 transition-colors font-sans tracking-tight"
        >
          Foundry
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="transform hover:scale-105 transition-all font-mono border border-border hover:border-accent/30"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg border border-transparent text-sm font-medium transition-all transform hover:scale-105 animate-fade-in",
                isActive
                  ? "bg-accent/10 text-accent border-accent/30 scale-105"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-accent hover:border-accent/20"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <item.icon className="mr-3 h-5 w-5 transition-transform hover:scale-110" />
              {item.name}
              {item.name === "Messages" && unreadCount > 0 && (
                <span className="ml-auto bg-accent text-accent-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center px-3 py-2 rounded-lg border border-transparent text-sm font-medium transition-all transform hover:scale-105 animate-fade-in",
              pathname === "/admin"
                ? "bg-accent/10 text-accent border-accent/30 scale-105"
                : "text-muted-foreground hover:bg-muted/50 hover:text-accent hover:border-accent/20"
            )}
          >
            <Shield className="mr-3 h-5 w-5 transition-transform hover:scale-110" />
            Admin
          </Link>
        )}
      </nav>

      {/* Bottom Profile + Sign Out */}
      <div className="border-t border-border p-4 space-y-2">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 border border-transparent transition-all hover:bg-muted/50 hover:border-accent/20 group",
            pathname === "/profile" && "bg-accent/10 border-accent/30"
          )}
        >
          {/* Avatar with upload overlay */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-accent">
                  {session?.user?.name?.[0]?.toUpperCase() || "?"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Upload avatar"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              ) : (
                <Camera className="h-3 w-3 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {/* Name + email */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-tight">
              {session?.user?.name || "Profile"}
            </p>
            <p className="text-xs text-helper truncate font-mono">
              {session?.user?.email || ""}
            </p>
          </div>
        </Link>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 border border-transparent text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all transform hover:scale-105"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
