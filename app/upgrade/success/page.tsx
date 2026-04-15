"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function UpgradeSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
      <Card className="max-w-md w-full text-center card-hover animate-scale-in">
        <CardContent className="pt-10 pb-10">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-h2 font-bold mb-3">Payment Successful!</h1>
          <p className="text-body mb-2">Your subscription has been activated.</p>
          <p className="text-helper text-sm mb-8">
            You now have access to all premium features. Redirecting to dashboard in 5 seconds...
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/dashboard")} className="transform hover:scale-105 transition-all">
              Go to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => router.push("/upgrade")} className="transform hover:scale-105 transition-all">
              View Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
