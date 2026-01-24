import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  Home, 
  Plus, 
  BookOpen, 
  Users, 
  User, 
  Settings 
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
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background animate-slide-in">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/dashboard" className="text-h3 font-bold hover:text-accent transition-colors">
          Foundry
        </Link>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 animate-fade-in",
                isActive
                  ? "bg-muted text-foreground scale-105"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <item.icon className="mr-3 h-5 w-5 transition-transform hover:scale-110" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}