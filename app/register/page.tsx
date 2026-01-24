"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleNext = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      setError("Please select your role");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/login?message=Registration successful");
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const selectRole = (role: string) => {
    setFormData({ ...formData, role });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-in">
          <Link href="/" className="text-h2 font-bold hover:text-accent transition-colors">
            Foundry
          </Link>
          <p className="text-helper mt-2">Join the community</p>
        </div>
        
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="transition-all">
              {step === 1 ? "Create your account" : "Choose your role"}
            </CardTitle>
            <CardDescription className="transition-all">
              {step === 1 
                ? "Get started with your entrepreneurial journey"
                : "Select the role that best describes you"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-4 animate-fade-in">
                {error}
              </div>
            )}
            
            {step === 1 ? (
              <div className="space-y-4 animate-slide-in">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="transition-all focus:scale-105"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="transition-all focus:scale-105"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="transition-all focus:scale-105"
                  />
                </div>
                
                <Button 
                  type="button" 
                  className="w-full transform hover:scale-105 transition-all" 
                  size="lg"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => selectRole("explorer")}
                      className={`p-3 text-left border rounded-lg hover:bg-muted transition-all transform hover:scale-105 ${
                        formData.role === "explorer" ? "border-accent bg-muted scale-105" : "border-border"
                      }`}
                    >
                      <div className="font-medium">Explorer</div>
                      <div className="text-helper text-sm">Just starting out, looking for guidance</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectRole("builder")}
                      className={`p-3 text-left border rounded-lg hover:bg-muted transition-all transform hover:scale-105 ${
                        formData.role === "builder" ? "border-accent bg-muted scale-105" : "border-border"
                      }`}
                    >
                      <div className="font-medium">Builder</div>
                      <div className="text-helper text-sm">Working on my startup, need specific help</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => selectRole("mentor")}
                      className={`p-3 text-left border rounded-lg hover:bg-muted transition-all transform hover:scale-105 ${
                        formData.role === "mentor" ? "border-accent bg-muted scale-105" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Mentor</span>
                        <Badge variant="verified" className="animate-pulse">Verified</Badge>
                      </div>
                      <div className="text-helper text-sm">Experienced entrepreneur, here to help</div>
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="transform hover:scale-105 transition-all"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 transform hover:scale-105 transition-all" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </form>
            )}
            
            <div className="text-center mt-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <p className="text-helper">
                Already have an account?{" "}
                <Link href="/login" className="text-accent hover:underline transition-all hover:text-accent/80">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}