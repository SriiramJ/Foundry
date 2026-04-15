"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, LogOut, ArrowLeft, CheckCircle, Smartphone, Copy, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [show2FADisable, setShow2FADisable] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFASecret, setTwoFASecret] = useState("");
  const [twoFAOtp, setTwoFAOtp] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAMessage, setTwoFAMessage] = useState("");
  const [twoFAError, setTwoFAError] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    notifications: {
      newSolutions: true,
      mentorResponses: true,
      weeklyDigest: false,
    }
  });

  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
      fetch2FAStatus();
    }
  }, [session]);

  const fetch2FAStatus = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.twoFactorEnabled || false);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          notifications: {
            newSolutions: data.notifyNewSolutions ?? true,
            mentorResponses: data.notifyMentorResponses ?? true,
            weeklyDigest: data.notifyWeeklyDigest ?? false,
          },
        });
      }
    } catch {}
  };

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await fetch("/api/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setQrCode(data.qrCode);
        setTwoFASecret(data.secret);
        setShow2FASetup(true);
        setTwoFAOtp("");
        setTwoFAMessage("");
      } else {
        setTwoFAError(data.error || "Failed to setup 2FA");
      }
    } catch {
      setTwoFAError("Something went wrong");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!twoFAOtp || twoFAOtp.length !== 6) {
      setTwoFAError("Please enter the 6-digit code");
      return;
    }
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await fetch("/api/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: twoFAOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(true);
        setShow2FASetup(false);
        setTwoFAMessage("2FA enabled successfully!");
        setTwoFAOtp("");
      } else {
        setTwoFAError(data.error || "Invalid code");
      }
    } catch {
      setTwoFAError("Something went wrong");
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFAOtp || twoFAOtp.length !== 6) {
      setTwoFAError("Please enter the 6-digit code to confirm");
      return;
    }
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: twoFAOtp })
      });
      const data = await res.json();
      if (res.ok) {
        setTwoFactorEnabled(false);
        setShow2FADisable(false);
        setTwoFAMessage("2FA disabled successfully.");
        setTwoFAOtp("");
      } else {
        setTwoFAError(data.error || "Invalid code");
      }
    } catch {
      setTwoFAError("Something went wrong");
    } finally {
      setTwoFALoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription);
      }
    } catch {}
  };

  const handleManageBilling = async () => {
    router.push("/upgrade");
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
      
      alert("Settings saved successfully!");
    } catch (error) {
      console.error('Settings save error:', error);
      alert(error instanceof Error ? error.message : "Error saving settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleChangePassword = async () => {
    setPasswordLoading(true);
    setPasswordMessage("");
    
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: passwordEmail || session?.user?.email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordMessage("Password reset email sent! Check your inbox.");
        setTimeout(() => setShowPasswordModal(false), 3000);
      } else {
        setPasswordMessage(data.error || "Failed to send reset email");
      }
    } catch (error) {
      setPasswordMessage("Error sending reset email");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <Button 
        variant="secondary" 
        onClick={() => router.back()}
        className="mb-6 transform hover:scale-105 transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Settings</h1>
        <p className="text-body">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 transition-transform hover:scale-110" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and profile details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="animate-fade-in">
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="transition-all focus:scale-105"
                />
              </div>
              <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  type="email"
                  className="transition-all focus:scale-105"
                />
              </div>
            </div>
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <div className="flex items-center gap-2">
                <Badge variant="verified" className="animate-pulse">{session?.user?.role || "Builder"}</Badge>
                <span className="text-sm text-helper">Contact support to change your role</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.3s'}}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 transition-transform hover:scale-110" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose what notifications you want to receive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between animate-slide-in">
              <div>
                <p className="font-medium">New Solutions</p>
                <p className="text-sm text-helper">Get notified when someone provides a solution to your problems</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.newSolutions}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, newSolutions: e.target.checked }
                })}
                className="h-4 w-4 transition-transform hover:scale-110"
              />
            </div>
            <div className="flex items-center justify-between animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div>
                <p className="font-medium">Mentor Responses</p>
                <p className="text-sm text-helper">Get notified when mentors respond to your questions</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.mentorResponses}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, mentorResponses: e.target.checked }
                })}
                className="h-4 w-4 transition-transform hover:scale-110"
              />
            </div>
            <div className="flex items-center justify-between animate-slide-in" style={{animationDelay: '0.2s'}}>
              <div>
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-helper">Receive a weekly summary of community activity</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications.weeklyDigest}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: { ...formData.notifications, weeklyDigest: e.target.checked }
                })}
                className="h-4 w-4 transition-transform hover:scale-110"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 transition-transform hover:scale-110" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage your account security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between animate-slide-in">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-helper">Last changed 30 days ago</p>
              </div>
              <Button variant="secondary" onClick={() => setShowPasswordModal(true)} className="transform hover:scale-105 transition-all">Change Password</Button>
            </div>
            <div className="flex items-center justify-between animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-helper">
                  {twoFactorEnabled
                    ? "2FA is enabled. Your account is protected."
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorEnabled && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
                <Button
                  variant={twoFactorEnabled ? "outline" : "secondary"}
                  onClick={() => {
                    setTwoFAError("");
                    setTwoFAOtp("");
                    if (twoFactorEnabled) {
                      setShow2FADisable(true);
                      setShow2FASetup(false);
                    } else {
                      handleSetup2FA();
                    }
                  }}
                  disabled={twoFALoading}
                  className="transform hover:scale-105 transition-all"
                >
                  {twoFALoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      Loading...
                    </span>
                  ) : twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </div>
            </div>

            {/* 2FA Success Message */}
            {twoFAMessage && !show2FASetup && !show2FADisable && (
              <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg animate-fade-in">
                {twoFAMessage}
              </div>
            )}

            {/* 2FA Setup Panel */}
            {show2FASetup && (
              <div className="border border-border rounded-lg p-4 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-accent" />
                  <p className="font-medium">Set up Authenticator App</p>
                </div>

                <div className="space-y-3 text-sm text-helper">
                  <p>1. Install an authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)</p>
                  <p>2. Scan the QR code below or enter the secret key manually</p>
                  <p>3. Enter the 6-digit code from the app to confirm</p>
                </div>

                {/* QR Code */}
                {qrCode && (
                  <div className="flex justify-center">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border border-border rounded-lg" />
                  </div>
                )}

                {/* Manual Secret */}
                <div>
                  <p className="text-xs text-helper mb-1">Or enter this key manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {showSecret ? twoFASecret : "•".repeat(twoFASecret.length)}
                    </code>
                    <button onClick={() => setShowSecret(!showSecret)} className="p-1 text-helper hover:text-foreground">
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText(twoFASecret); }}
                      className="p-1 text-helper hover:text-accent"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                {twoFAError && (
                  <p className="text-sm text-red-500">{twoFAError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={twoFAOtp}
                    onChange={(e) => { setTwoFAOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFAError(""); }}
                    maxLength={6}
                    className="flex-1 font-mono text-center text-lg tracking-widest"
                  />
                  <Button onClick={handleEnable2FA} disabled={twoFALoading || twoFAOtp.length !== 6}>
                    {twoFALoading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => { setShow2FASetup(false); setTwoFAError(""); }} className="w-full">
                  Cancel
                </Button>
              </div>
            )}

            {/* 2FA Disable Panel */}
            {show2FADisable && (
              <div className="border border-red-200 rounded-lg p-4 space-y-3 animate-fade-in bg-red-50/5">
                <p className="font-medium text-sm">Disable Two-Factor Authentication</p>
                <p className="text-sm text-helper">Enter your current authenticator code to confirm disabling 2FA.</p>
                {twoFAError && (
                  <p className="text-sm text-red-500">{twoFAError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={twoFAOtp}
                    onChange={(e) => { setTwoFAOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFAError(""); }}
                    maxLength={6}
                    className="flex-1 font-mono text-center text-lg tracking-widest"
                  />
                  <Button variant="outline" onClick={handleDisable2FA} disabled={twoFALoading || twoFAOtp.length !== 6} className="text-red-600 border-red-300">
                    {twoFALoading ? "Disabling..." : "Confirm Disable"}
                  </Button>
                </div>
                <Button variant="outline" onClick={() => { setShow2FADisable(false); setTwoFAError(""); }} className="w-full">
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card className="card-hover animate-scale-in" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 transition-transform hover:scale-110" />
              <CardTitle>Subscription</CardTitle>
            </div>
            <CardDescription>
              Manage your subscription and billing information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between animate-slide-in">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-helper">
                  {subscription?.status === "active"
                    ? `${subscription.plan} plan — active`
                    : "Free Plan — Upgrade to unlock premium features"}
                </p>
              </div>
              {subscription?.status === "active" ? (
                <Button
                  onClick={handleManageBilling}
                  variant="outline"
                  className="transform hover:scale-105 transition-all"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              ) : (
                <Button onClick={() => router.push("/upgrade")} className="transform hover:scale-105 transition-all">
                  Upgrade Now
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Button
            variant="secondary"
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 transform hover:scale-105 transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="transform hover:scale-105 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md problem-card">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>We'll send a reset link to your email</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordMessage && (
                <div className={`p-3 text-sm rounded mb-4 ${
                  passwordMessage.includes('sent') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {passwordMessage}
                </div>
              )}
              <div className="space-y-4">
                <Input
                  type="email"
                  placeholder="Confirm your email"
                  value={passwordEmail}
                  onChange={(e) => setPasswordEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-1 btn-primary"
                  >
                    {passwordLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}