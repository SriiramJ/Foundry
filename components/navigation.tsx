import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navigation() {
  return (
    <nav className="border-b border-border bg-background animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-h3 font-bold hover:text-accent transition-colors">
              Foundry
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/how-it-works" className="text-body hover:text-foreground transition-colors transform hover:scale-105">
                How it Works
              </Link>
              <Link href="/pricing" className="text-body hover:text-foreground transition-colors transform hover:scale-105">
                Pricing
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="text" className="transform hover:scale-105 transition-all">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="transform hover:scale-105 transition-all">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}