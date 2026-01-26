"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, MessageSquare, CheckCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HowItWorksPage() {
  const router = useRouter();

  const steps = [
    {
      icon: MessageSquare,
      title: "Post Your Problem",
      description: "Share your startup challenge with detailed context and category",
      color: "text-blue-500"
    },
    {
      icon: Users,
      title: "Get Expert Solutions",
      description: "Mentors and experienced builders provide tailored solutions",
      color: "text-green-500"
    },
    {
      icon: CheckCircle,
      title: "Verify & Implement",
      description: "Mark the best solution as verified and implement it",
      color: "text-purple-500"
    },
    {
      icon: Star,
      title: "Build Reputation",
      description: "Earn reputation points by helping others and getting upvotes",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button 
        variant="secondary" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">How Foundry Works</h1>
        <p className="text-lg text-muted-foreground">
          Connect with mentors, solve problems, and build your startup with community support
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {steps.map((step, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full bg-muted ${step.color}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-none dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join our community of entrepreneurs and mentors today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/register')} className="min-w-[120px]">
              Join Now
            </Button>
            <Button variant="outline" onClick={() => router.push('/problems')} className="min-w-[120px]">
              Browse Problems
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}