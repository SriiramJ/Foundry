"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenExpired" || session?.error === "UserNotFound") {
      signOut({ callbackUrl: "/login?error=SessionExpired" });
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex animate-fade-in">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav — hidden on desktop */}
      <MobileNav />
    </div>
  );
}
