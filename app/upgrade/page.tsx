"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star, Zap, Crown, ArrowLeft, CreditCard, Calendar, AlertCircle } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
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
      { name: "Advanced analytics", included: false },
      { name: "1-on-1 mentor sessions", included: false },
    ],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹399",
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
      { name: "Advanced analytics", included: false },
      { name: "1-on-1 mentor sessions", included: false },
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹599",
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
      { name: "Advanced analytics", included: true },
      { name: "1-on-1 mentor sessions", included: true },
    ],
    popular: false,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, TechStart",
    content: "The premium knowledge base helped me avoid costly mistakes. Worth every penny.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "CEO, GrowthCo",
    content: "Priority mentor responses saved me weeks of research. Game changer for my startup.",
    rating: 5,
  },
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (session?.user) fetchSubscription();
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch {}
  };

  const currentPlan = subscription?.plan?.toLowerCase() || "free";
  const isActive = subscription?.status === "active";
  const endDate = subscription?.endDate ? new Date(subscription.endDate) : null;
  const isExpired = endDate ? endDate < new Date() : false;
  const daysLeft = endDate && !isExpired
    ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleUpgrade = async (planId: string) => {
    if (planId === "free") {
      // Downgrade — no payment needed, just update via upgrade API
      setLoadingPlan("free");
      try {
        const res = await fetch("/api/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: "free" }),
        });
        if (res.ok) {
          setSubscription(null);
          router.refresh();
        } else {
          alert("Failed to downgrade. Please try again.");
        }
      } catch {
        alert("Something went wrong.");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }
    setLoadingPlan(planId);

    try {
      // Step 1: Create Razorpay order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create order");
        setLoadingPlan(null);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Foundry",
        description: `${orderData.planName} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: { color: "#6366f1" },
        handler: async (response: any) => {
          // Step 3: Verify payment on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            router.push("/upgrade/success");
          } else {
            alert(verifyData.error || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch {
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  };

  const getPlanCta = (planId: string) => {
    if (planId === "free") {
      return currentPlan !== "free" && isActive && !isExpired ? "Downgrade to Free" : "Current Plan";
    }
    if (currentPlan === planId && isActive && !isExpired) return "Current Plan";
    if (currentPlan === planId && isExpired) return "Renew Plan";
    if (currentPlan !== "free" && isActive && !isExpired) return "Switch Plan";
    return "Upgrade Now";
  };

  const isPlanDisabled = (planId: string) => {
    if (planId === "free") return currentPlan === "free" || !isActive || isExpired;
    if (currentPlan === planId && isActive && !isExpired) return true;
    return false;
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="p-6 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <Button variant="secondary" onClick={() => router.back()} className="mb-6 transform hover:scale-105 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>

          <div className="text-center mb-12 animate-slide-in">
            <h1 className="text-h1 mb-4">Unlock Your Full Potential</h1>
            <p className="text-body text-xl max-w-2xl mx-auto">
              Get access to premium features, priority support, and exclusive content to accelerate your entrepreneurial journey.
            </p>
          </div>

          {/* Subscription Status Banner */}
          {currentPlan !== "free" && (
            <Card className={`mb-8 animate-fade-in ${
              isExpired
                ? "border-red-500/30 bg-red-500/5"
                : daysLeft <= 3
                ? "border-warning/30 bg-warning/5"
                : "border-success/30 bg-success/5"
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isExpired ? (
                      <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                    ) : daysLeft <= 3 ? (
                      <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isExpired
                          ? `Your ${currentPlan} plan has expired`
                          : `You're on the ${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan`}
                      </p>
                      <p className="text-sm text-helper flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {isExpired
                          ? `Expired on ${endDate?.toLocaleDateString()}`
                          : daysLeft <= 3
                          ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — renew now`
                          : `Active until ${endDate?.toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  {(isExpired || daysLeft <= 3) && (
                    <Badge className={isExpired ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-warning/20 text-warning border-warning/30"}>
                      {isExpired ? "Expired" : `${daysLeft}d left`}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 stagger-children">
            {plans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`relative card-hover animate-scale-in ${
                  plan.popular ? "border-accent shadow-lg scale-105" : ""
                } ${
                  currentPlan === plan.id && isActive && !isExpired ? "border-success/50" : ""
                } ${
                  currentPlan === plan.id && isExpired ? "border-red-500/30" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge variant="premium" className="px-4 py-1 animate-pulse">
                      <Star className="w-3 h-3 mr-1" />Most Popular
                    </Badge>
                  </div>
                )}
                {currentPlan === plan.id && !isExpired && isActive && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-success text-white px-3 py-1">Active</Badge>
                  </div>
                )}
                {currentPlan === plan.id && isExpired && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-red-500 text-white px-3 py-1">Expired</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    {plan.id === "free" && <Zap className="w-8 h-8 text-accent mx-auto" />}
                    {plan.id === "premium" && <Star className="w-8 h-8 text-warning mx-auto" />}
                    {plan.id === "pro" && <Crown className="w-8 h-8 text-success mx-auto" />}
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
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        {feature.included ? (
                          <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mr-3 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full transform hover:scale-105 transition-all"
                    variant={plan.popular ? "default" : "secondary"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isPlanDisabled(plan.id) || loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Opening Payment...
                      </span>
                    ) : (
                      <>
                        {plan.id !== "free" && !isPlanDisabled(plan.id) && <CreditCard className="mr-2 h-4 w-4" />}
                        {getPlanCta(plan.id)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Secure Payment Note */}
          <div className="text-center mb-12 animate-fade-in">
            <p className="text-sm text-helper flex items-center justify-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments are securely processed by Razorpay. Supports UPI, Cards, Net Banking & Wallets.
            </p>
          </div>

          {/* Testimonials */}
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-h2 mb-8">What Our Premium Users Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <Card key={i} className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-warning fill-current" />
                      ))}
                    </div>
                    <p className="text-helper mb-4">"{t.content}"</p>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-helper">{t.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <Card className="card-hover animate-fade-in">
            <CardHeader>
              <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Can I cancel anytime?</h3>
                <p className="text-helper">Yes, you can cancel your subscription at any time.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">What payment methods do you accept?</h3>
                <p className="text-helper">UPI, Credit/Debit Cards, Net Banking, and Wallets via Razorpay.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Can I switch plans?</h3>
                <p className="text-helper">Yes, upgrade or downgrade anytime. Changes take effect immediately.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Is there a free trial?</h3>
                <p className="text-helper">We offer a generous free tier. Upgrade anytime to unlock premium features.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
