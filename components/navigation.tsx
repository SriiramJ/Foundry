"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!session?.user;
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="border-b border-border bg-background animate-fade-in sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-h3 font-bold text-accent hover:text-accent/80 transition-colors font-sans tracking-tight">
            Foundry
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-baseline space-x-8">
            <Link href="/how-it-works" className="text-body hover:text-accent transition-colors font-mono">
              How it Works
            </Link>
            <Link href="/upgrade" className="text-body hover:text-accent transition-colors font-mono">
              Pricing
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="border border-border hover:border-accent/30">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isLoggedIn && (
              <Link href="/login">
                <Button variant="ghost" className="border border-border hover:border-accent/30 font-mono">
                  Sign In
                </Button>
              </Link>
            )}
            <Link href={isLoggedIn ? dashboardHref : "/register"}>
              <Button className="btn-primary font-mono">
                {isLoggedIn ? "Go to Dashboard" : "Get Started"}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="border border-border">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-border text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/how-it-works"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="/upgrade"
              className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              {!isLoggedIn && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-mono">Sign In</Button>
                </Link>
              )}
              <Link href={isLoggedIn ? dashboardHref : "/register"} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full btn-primary font-mono">
                  {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
