"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function HeroCta() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: "0.4s" }}>
      <Link href={isLoggedIn ? dashboardHref : "/register"}>
        <Button size="lg" className="transform hover:scale-105 transition-transform">
          {isLoggedIn ? "Go to Dashboard" : "Start Solving Problems"}
        </Button>
      </Link>
      <Link href="/how-it-works">
        <Button variant="secondary" size="lg" className="transform hover:scale-105 transition-transform">
          How it Works
        </Button>
      </Link>
    </div>
  );
}

export function GetStartedCta() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const dashboardHref = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <div className="mt-12 animate-scale-in">
      <Link href={isLoggedIn ? dashboardHref : "/register"}>
        <Button size="lg" className="transform hover:scale-105 transition-transform">
          {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
        </Button>
      </Link>
    </div>
  );
}
