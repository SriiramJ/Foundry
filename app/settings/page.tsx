"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, LogOut, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    notifications: {
      newSolutions: true,
      mentorResponses: true,
      weeklyDigest: false,
    }
  });

  const handleSave = async () => {
    setIsLoading(true);
    // In a real app, this would save to the database
    setTimeout(() => {
      setIsLoading(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
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
              <Button variant="secondary" className="transform hover:scale-105 transition-all">Change Password</Button>
            </div>
            <div className="flex items-center justify-between animate-slide-in" style={{animationDelay: '0.1s'}}>
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-helper">Add an extra layer of security to your account</p>
              </div>
              <Button variant="secondary" className="transform hover:scale-105 transition-all">Enable 2FA</Button>
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
                <p className="text-sm text-helper">Free Plan - Upgrade to unlock premium features</p>
              </div>
              <Button className="transform hover:scale-105 transition-all">Upgrade Now</Button>
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
    </div>
  );
}