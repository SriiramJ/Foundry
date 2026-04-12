"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, LogOut, ArrowLeft, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
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
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        notifications: {
          newSolutions: true,
          mentorResponses: true,
          weeklyDigest: false,
        }
      });
      fetchSubscription();
    }
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

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Failed to open billing portal");
    } catch {
      alert("Something went wrong.");
    } finally {
      setIsBillingLoading(false);
    }
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

  const handleEnable2FA = async () => {
    try {
      // Placeholder for 2FA setup functionality
      alert("2FA setup functionality coming soon!");
    } catch (error) {
      console.error('2FA setup error:', error);
      alert("Failed to enable 2FA");
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
                <p className="text-sm text-helper">Add an extra layer of security to your account</p>
              </div>
              <Button variant="secondary" onClick={handleEnable2FA} className="transform hover:scale-105 transition-all">Enable 2FA</Button>
            </div>
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
                  disabled={isBillingLoading}
                  variant="outline"
                  className="transform hover:scale-105 transition-all"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isBillingLoading ? "Loading..." : "Manage Billing"}
                  <ExternalLink className="ml-2 h-3 w-3" />
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