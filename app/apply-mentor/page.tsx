"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function ApplyMentorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    expertise: "",
    experience: "",
    background: "",
    proofOfWork: ""
  });

  useEffect(() => {
    if (session?.user) {
      checkExistingApplication();
    }
  }, [session]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/mentor-application');
      if (response.ok) {
        const data = await response.json();
        setExistingApplication(data.application);
      }
    } catch (error) {
      console.error('Failed to check application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/mentor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/profile?message=Application submitted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit application');
      }
    } catch (error) {
      alert('Error submitting application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'REJECTED': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'NEEDS_INFO': return <AlertCircle className="h-5 w-5 text-warning" />;
      default: return <Clock className="h-5 w-5 text-accent" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="verified">Approved</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      case 'NEEDS_INFO': return <Badge variant="premium">Needs Info</Badge>;
      default: return <Badge variant="default">Pending Review</Badge>;
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
        <h1 className="text-h1 mb-2">Apply to become a Mentor</h1>
        <p className="text-body">Share your expertise and help other entrepreneurs succeed.</p>
      </div>

      {existingApplication ? (
        <Card className="card-hover animate-scale-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getStatusIcon(existingApplication.status)}
              <div>
                <CardTitle>Your Application</CardTitle>
                <CardDescription>
                  Submitted on {new Date(existingApplication.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              {getStatusBadge(existingApplication.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Area of Expertise</h4>
                <p className="text-helper">{existingApplication.expertise}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Years of Experience</h4>
                <p className="text-helper">{existingApplication.experience} years</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Background</h4>
                <p className="text-helper">{existingApplication.background}</p>
              </div>
              {existingApplication.reviewNotes && (
                <div>
                  <h4 className="font-medium mb-1">Review Notes</h4>
                  <p className="text-helper">{existingApplication.reviewNotes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-hover animate-scale-in">
          <CardHeader>
            <CardTitle>Mentor Application Form</CardTitle>
            <CardDescription>
              Tell us about your experience and expertise to help us review your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Area of Expertise</label>
                <Input
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g., Product Development, Marketing, Fundraising"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Enter years of experience"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Background & Achievements</label>
                <textarea
                  className="w-full min-h-[120px] p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  placeholder="Tell us about your entrepreneurial journey, companies you've built, achievements, etc."
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Proof of Experience</label>
                <Input
                  value={formData.proofOfWork}
                  onChange={(e) => setFormData({ ...formData, proofOfWork: e.target.value })}
                  placeholder="LinkedIn profile, company website, portfolio URL, etc."
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full transform hover:scale-105 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}