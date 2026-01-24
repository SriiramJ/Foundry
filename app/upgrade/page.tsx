"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star, Zap, Crown, ArrowLeft } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      { name: "Post unlimited problems", included: true },
      { name: "View all solutions", included: true },
      { name: "Basic knowledge base access", included: true },
      { name: "Community discussions", included: true },
      { name: "Priority problem posting", included: false },
      { name: "Premium mentor responses", included: false },
      { name: "Advanced search filters", included: false },
      { name: "Detailed analytics", included: false },
      { name: "1-on-1 mentor sessions", included: false }
    ],
    cta: "Current Plan",
    popular: false
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    period: "per month",
    description: "For serious entrepreneurs",
    features: [
      { name: "Post unlimited problems", included: true },
      { name: "View all solutions", included: true },
      { name: "Full knowledge base access", included: true },
      { name: "Community discussions", included: true },
      { name: "Priority problem posting", included: true },
      { name: "Premium mentor responses", included: true },
      { name: "Advanced search filters", included: true },
      { name: "Detailed analytics", included: true },
      { name: "1-on-1 mentor sessions", included: false }
    ],
    cta: "Upgrade Now",
    popular: true
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "per month",
    description: "For scaling businesses",
    features: [
      { name: "Post unlimited problems", included: true },
      { name: "View all solutions", included: true },
      { name: "Full knowledge base access", included: true },
      { name: "Community discussions", included: true },
      { name: "Priority problem posting", included: true },
      { name: "Premium mentor responses", included: true },
      { name: "Advanced search filters", included: true },
      { name: "Detailed analytics", included: true },
      { name: "1-on-1 mentor sessions", included: true }
    ],
    cta: "Upgrade Now",
    popular: false
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, TechStart",
    content: "The premium knowledge base helped me avoid costly mistakes. Worth every penny.",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "CEO, GrowthCo",
    content: "Priority mentor responses saved me weeks of research. Game changer for my startup.",
    rating: 5
  }
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("premium");

  const handleUpgrade = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      
      if (response.ok) {
        alert(`Successfully upgraded to ${planId} plan!`);
        window.location.reload();
      } else {
        alert('Upgrade failed. Please try again.');
      }
    } catch (error) {
      alert('Error processing upgrade');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Button 
          variant="secondary" 
          onClick={() => router.back()}
          className="mb-6 transform hover:scale-105 transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {/* Header */}
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-h1 mb-4">Unlock Your Full Potential</h1>
          <p className="text-body text-xl max-w-2xl mx-auto">
            Get access to premium features, priority support, and exclusive content to accelerate your entrepreneurial journey.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 stagger-children">
          {plans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={`relative card-hover animate-scale-in ${plan.popular ? 'border-accent shadow-lg scale-105' : ''}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge variant="premium" className="px-4 py-1 animate-pulse">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mb-4">
                  {plan.id === "free" && <Zap className="w-8 h-8 text-accent mx-auto transition-transform hover:scale-110" />}
                  {plan.id === "premium" && <Star className="w-8 h-8 text-warning mx-auto transition-transform hover:scale-110" />}
                  {plan.id === "pro" && <Crown className="w-8 h-8 text-success mx-auto transition-transform hover:scale-110" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-helper ml-1">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center animate-fade-in" style={{animationDelay: `${featureIndex * 0.05}s`}}>
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full transform hover:scale-105 transition-all ${plan.popular ? 'animate-pulse' : ''}`}
                  variant={plan.popular ? "default" : "secondary"}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading || (plan.id === "free" && !session?.user?.isPremium)}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-16 card-hover animate-fade-in" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle className="text-center">Why Upgrade?</CardTitle>
            <CardDescription className="text-center">
              See what you get with premium access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                  <Zap className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-medium mb-2">Priority Support</h3>
                <p className="text-sm text-helper">
                  Get your problems seen first and receive faster responses from mentors.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-medium mb-2">Premium Content</h3>
                <p className="text-sm text-helper">
                  Access detailed implementation guides and expert insights.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                  <Star className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-medium mb-2">Advanced Analytics</h3>
                <p className="text-sm text-helper">
                  Track your progress and get insights into your entrepreneurial journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <div className="text-center mb-16 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <h2 className="text-h2 mb-8">What Our Premium Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-children">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-warning fill-current animate-fade-in" style={{animationDelay: `${i * 0.1}s`}} />
                    ))}
                  </div>
                  <p className="text-helper mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-helper">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <Card className="card-hover animate-fade-in" style={{animationDelay: '0.6s'}}>
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="animate-slide-in">
                <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                <p className="text-helper">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div className="animate-slide-in" style={{animationDelay: '0.1s'}}>
                <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-helper">
                  We accept all major credit cards and PayPal. All payments are processed securely through Stripe.
                </p>
              </div>
              <div className="animate-slide-in" style={{animationDelay: '0.2s'}}>
                <h3 className="font-medium mb-2">Is there a free trial?</h3>
                <p className="text-helper">
                  We offer a generous free tier that lets you explore the platform. You can upgrade anytime to access premium features.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}