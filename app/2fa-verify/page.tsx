"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Smartphone } from "lucide-react";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const s = session as any;
      if (!s.twoFactorEnabled || s.twoFactorVerified) {
        router.push("/dashboard");
      }
    }
  }, [session, status, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== "") && newOtp.join("").length === 6) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpCode })
      });

      const data = await res.json();

      if (data.success) {
        // Update the JWT so twoFactorVerified becomes true
        await update({ twoFactorVerified: true });
        router.push("/dashboard");
      } else {
        setError(data.error || "Invalid code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-slide-in">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-h2 font-bold mb-2">Two-Factor Authentication</h1>
          <p className="text-helper">Enter the 6-digit code from your authenticator app</p>
        </div>

        <Card className="card-hover animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Verify your identity
            </CardTitle>
            <CardDescription>
              Open your authenticator app and enter the code for <strong>Foundry</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg mb-4 animate-fade-in">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-lg bg-input text-foreground outline-none transition-all
                    ${digit ? "border-accent" : "border-border"}
                    focus:border-accent focus:scale-105`}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <Button
              onClick={() => handleVerify()}
              disabled={isLoading || otp.some(d => d === "")}
              className="w-full transform hover:scale-105 transition-all"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </span>
              ) : "Verify Code"}
            </Button>

            <p className="text-center text-xs text-helper mt-4">
              Code refreshes every 30 seconds. Make sure your device time is correct.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
