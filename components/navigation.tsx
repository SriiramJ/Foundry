"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-border bg-background animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-h3 font-bold text-accent hover:text-accent/80 transition-colors font-sans tracking-tight">
              Foundry
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/how-it-works" className="text-body hover:text-accent transition-colors transform hover:scale-105 font-mono">
                How it Works
              </Link>
              <Link href="/pricing" className="text-body hover:text-accent transition-colors transform hover:scale-105 font-mono">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="transform hover:scale-105 transition-all font-mono border border-border hover:border-accent/30"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/login">
              <Button variant="ghost" className="transform hover:scale-105 transition-all font-mono border border-border hover:border-accent/30">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="btn-primary transform hover:scale-105 transition-all font-mono">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}