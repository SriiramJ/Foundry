"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Shield } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-40">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-accent" />
            <h1 className="text-base md:text-h3 font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[150px]">
              {session?.user?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 md:px-6">
        {children}
      </main>
    </div>
  );
}
