import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { HeroCta, GetStartedCta } from "@/components/hero-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, BookOpen, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-h1 mb-6 animate-slide-in">
            Get unstuck. Build faster. Connect with entrepreneurs.
          </h1>
          <p className="text-body mb-8 text-xl max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
            Post your startup problems, get structured solutions from experienced entrepreneurs and mentors, and build a knowledge base for the entire community.
          </p>
          <HeroCta />
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted animate-fade-in">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-h2 mb-4">Every entrepreneur faces the same problems</h2>
          <p className="text-body mb-12 max-w-2xl mx-auto">
            From product-market fit to scaling challenges, you&apos;re not alone. Our platform connects you with solutions that actually work.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-h2 text-center mb-12">How it Works</h2>
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110">
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Post Your Problem</CardTitle>
                <CardDescription>
                  Describe your startup challenge with context about your stage, industry, and specific situation.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Get Solutions</CardTitle>
                <CardDescription>
                  Receive structured solutions from entrepreneurs who&apos;ve solved similar problems, with actionable steps.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="card-hover">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110">
                  <BookOpen className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle>Build Knowledge</CardTitle>
                <CardDescription>
                  Verified solutions become part of our searchable knowledge base, helping future entrepreneurs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted animate-fade-in">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-h2 mb-12">Built for entrepreneurs at every stage</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left stagger-children">
            <div className="animate-slide-in">
              <h3 className="text-h3 mb-4">Early-stage founders</h3>
              <p className="text-body">
                Get guidance on validation, MVP development, and finding product-market fit from those who&apos;ve been there.
              </p>
            </div>
            <div className="animate-slide-in">
              <h3 className="text-h3 mb-4">Scaling entrepreneurs</h3>
              <p className="text-body">
                Share your experience while getting help with hiring, operations, and growth challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-h2 mb-4">Simple, transparent pricing</h2>
          <p className="text-body mb-12">Start free, upgrade when you need more.</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto stagger-children">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-h2 mt-4">$0</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center animate-fade-in">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Post problems
                  </li>
                  <li className="flex items-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    View solutions
                  </li>
                  <li className="flex items-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Basic knowledge base
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-accent card-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Premium</CardTitle>
                  <Badge variant="premium" className="animate-pulse">Popular</Badge>
                </div>
                <CardDescription>For serious entrepreneurs</CardDescription>
                <div className="text-h2 mt-4">$29/mo</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center animate-fade-in">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Priority problem posting
                  </li>
                  <li className="flex items-center animate-fade-in" style={{animationDelay: '0.1s'}}>
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Full knowledge base access
                  </li>
                  <li className="flex items-center animate-fade-in" style={{animationDelay: '0.2s'}}>
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Premium mentor responses
                  </li>
                  <li className="flex items-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    Advanced filters
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <GetStartedCta />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-helper">© 2026 Foundry. Built for entrepreneurs, by entrepreneurs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}