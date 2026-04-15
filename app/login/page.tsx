"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'SessionExpired') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
      } else {
        const session = await getSession() as any;
        const callbackUrl = searchParams.get('callbackUrl');
        if (session?.user?.role === 'ADMIN') {
          router.push("/admin");
        } else if (session?.twoFactorEnabled && !session?.twoFactorVerified) {
          router.push("/2fa-verify");
        } else if (callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('/login')) {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-in">
          <Link href="/" className="text-h2 font-bold hover:text-accent transition-colors">
            Foundry
          </Link>
          <p className="text-helper mt-2">Welcome back</p>
        </div>
        
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle>Sign in to your account</CardTitle>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg animate-fade-in">
                  {error}
                </div>
              )}
              
              <div className="space-y-2 animate-slide-in" style={{animationDelay: '0.3s'}}>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all focus:scale-105"
                />
              </div>
              
              <div className="space-y-2 animate-slide-in" style={{animationDelay: '0.4s'}}>
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all focus:scale-105"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full transform hover:scale-105 transition-all animate-scale-in" 
                size="lg"
                disabled={isLoading}
                style={{animationDelay: '0.5s'}}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <div className="text-center mt-4 space-y-2 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <p className="text-helper">
                <Link href="/reset-password" className="text-accent hover:underline transition-all hover:text-accent/80">
                  Forgot your password?
                </Link>
              </p>
              <p className="text-helper">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-accent hover:underline transition-all hover:text-accent/80">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}