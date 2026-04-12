"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  // Force sign out if token refresh failed
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
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
