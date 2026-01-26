"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Plus, 
  BookOpen, 
  Users, 
  User, 
  Settings,
  Shield
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Post Problem", href: "/post-problem", icon: Plus },
  { name: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { name: "Mentors", href: "/mentors", icon: Users },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background animate-slide-in">
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <Link href="/dashboard" className="text-h3 font-bold text-accent hover:text-accent/80 transition-colors font-sans tracking-tight">
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
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
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
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <item.icon className="mr-3 h-5 w-5 transition-transform hover:scale-110" />
              {item.name}
            </Link>
          )
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
    </div>
  )
}