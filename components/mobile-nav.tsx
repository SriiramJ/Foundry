"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Home, Plus, BookOpen, Users, User, MessageCircle,
  Shield, Menu, X, Settings, Star, Sun, Moon, LogOut, Camera, Calendar, Search,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { signOut } from "next-auth/react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Problems", href: "/knowledge-base", icon: BookOpen },
  { name: "Post", href: "/post-problem", icon: Plus },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
];

const drawerNav = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Post Problem", href: "/post-problem", icon: Plus },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Sessions", href: "/mentor-sessions", icon: Calendar },
  { name: "Search", href: "/search", icon: Search },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Upgrade", href: "/upgrade", icon: Star },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB."); return; }
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
        if (res.ok) setAvatar(base64);
        else alert("Failed to upload avatar.");
      } catch { alert("Upload failed."); }
      finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs transition-all relative",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.name}</span>
                {item.name === "Messages" && unreadCount > 0 && (
                  <span className="absolute top-2 right-[calc(50%-14px)] bg-accent text-accent-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            );
          })}

          {/* Menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-xs text-muted-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden animate-fade-in"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-2xl md:hidden transition-transform duration-300",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Avatar with upload */}
            <div className="relative">
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
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                {uploading
                  ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                  : <Camera className="h-3 w-3 text-white" />
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-helper">{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {drawerNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  pathname === "/admin"
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Shield className="h-4 w-4 flex-shrink-0" />
                Admin
              </Link>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border pb-4">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
