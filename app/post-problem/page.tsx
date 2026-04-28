"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";

const categories = [
  { id: "PRODUCT_DEVELOPMENT", label: "Product Development", description: "MVP, features, technical decisions" },
  { id: "MARKETING", label: "Marketing", description: "Customer acquisition, branding, campaigns" },
  { id: "FUNDRAISING", label: "Fundraising", description: "Investment, pitch decks, investor relations" },
  { id: "OPERATIONS", label: "Operations", description: "Processes, scaling, efficiency" },
  { id: "HIRING", label: "Hiring", description: "Team building, recruitment, culture" },
  { id: "LEGAL", label: "Legal", description: "Contracts, compliance, intellectual property" },
  { id: "TECHNOLOGY", label: "Technology", description: "Tech stack, architecture, development" },
  { id: "STRATEGY", label: "Strategy", description: "Business model, market positioning" },
];

const stages = [
  { id: "IDEA", label: "Idea Stage", description: "Just getting started with an idea" },
  { id: "MVP", label: "MVP Stage", description: "Building or testing minimum viable product" },
  { id: "EARLY_STAGE", label: "Early Stage", description: "Have product, seeking product-market fit" },
  { id: "GROWTH", label: "Growth Stage", description: "Scaling and growing the business" },
  { id: "SCALING", label: "Scaling Stage", description: "Established business, optimizing operations" },
];

export default function PostProblemPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    stage: "",
    tags: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if ((session?.user as any)?.role === "MENTOR") {
      router.replace("/dashboard");
    }
  }, [session]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category.toUpperCase(),
          stage: formData.stage.toUpperCase(),
          tags: []
        }),
      });

      if (response.ok) {
        const problem = await response.json();
        router.push(`/problems/${problem.id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to post problem");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title.trim().length >= 10;
      case 2: return formData.description.trim().length >= 50;
      case 3: return formData.category.length > 0;
      case 4: return formData.stage.length > 0;
      default: return false;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <Button 
        variant="secondary" 
        onClick={() => router.back()}
        className="mb-6 transform hover:scale-105 transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Post a Problem</h1>
        <p className="text-body">Get help from the entrepreneur community with your specific challenge.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 transform ${
              step <= currentStep ? "bg-accent text-accent-foreground scale-110" : "bg-muted text-muted-foreground"
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-16 h-1 mx-2 transition-all duration-500 ${
                step < currentStep ? "bg-accent" : "bg-muted"
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card className="card-hover animate-scale-in" style={{animationDelay: '0.3s'}}>
        <CardHeader>
          <CardTitle className="transition-all duration-300">
            {currentStep === 1 && "What's your problem?"}
            {currentStep === 2 && "Describe the details"}
            {currentStep === 3 && "Choose a category"}
            {currentStep === 4 && "What's your startup stage?"}
          </CardTitle>
          <CardDescription className="transition-all duration-300">
            {currentStep === 1 && "Give your problem a clear, specific title"}
            {currentStep === 2 && "Provide context and details about your situation"}
            {currentStep === 3 && "Help others find and understand your problem"}
            {currentStep === 4 && "This helps mentors provide relevant advice"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-4 animate-fade-in">
              {error}
            </div>
          )}

          {/* Step 1: Title */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-slide-in">
              <Input
                placeholder="e.g., How do I validate product-market fit for my B2B SaaS?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-lg transition-all focus:scale-105"
              />
              <p className="text-helper text-sm animate-fade-in" style={{animationDelay: '0.2s'}}>
                Be specific and clear. Good titles get better responses. ({formData.title.trim().length}/10 min characters)
              </p>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-slide-in">
              <textarea
                className="w-full min-h-[200px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all focus:scale-105"
                placeholder="Describe your situation in detail. Include:
• What you've tried so far
• Your current situation
• Specific challenges you're facing
• What kind of help you're looking for"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-helper text-sm animate-fade-in" style={{animationDelay: '0.2s'}}>
                The more context you provide, the better solutions you'll receive. ({formData.description.trim().length}/50 min characters)
              </p>
            </div>
          )}

          {/* Step 3: Category */}
          {currentStep === 3 && (
            <div className="space-y-3 animate-slide-in">
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => setFormData({ ...formData, category: category.id })}
                  className={`w-full p-4 text-left border rounded-lg hover:bg-muted transition-all transform hover:scale-105 animate-fade-in ${
                    formData.category === category.id ? "border-accent bg-muted scale-105" : "border-border"
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="font-medium">{category.label}</div>
                  <div className="text-helper text-sm">{category.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Stage */}
          {currentStep === 4 && (
            <div className="space-y-3 animate-slide-in">
              {stages.map((stage, index) => (
                <button
                  key={stage.id}
                  onClick={() => setFormData({ ...formData, stage: stage.id })}
                  className={`w-full p-4 text-left border rounded-lg hover:bg-muted transition-all transform hover:scale-105 animate-fade-in ${
                    formData.stage === stage.id ? "border-accent bg-muted scale-105" : "border-border"
                  }`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="font-medium">{stage.label}</div>
                  <div className="text-helper text-sm">{stage.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="transform hover:scale-105 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="transform hover:scale-105 transition-all"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isLoading}
                className="transform hover:scale-105 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </span>
                ) : (
                  "Post Problem"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}