"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, AlertCircle, Clock, User } from "lucide-react";

export default function AdminPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/mentor-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      } else {
        console.error('Failed to fetch applications:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (applicationId: string, status: string, reviewNotes?: string) => {
    try {
      const response = await fetch('/api/admin/mentor-applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status, reviewNotes })
      });

      if (response.ok) {
        fetchApplications(); // Refresh the list
        alert('Application updated successfully');
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      alert('Error updating application');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="verified">Approved</Badge>;
      case 'REJECTED': return <Badge variant="outline" className="text-red-500 border-red-500">Rejected</Badge>;
      case 'NEEDS_INFO': return <Badge variant="premium">Needs Info</Badge>;
      default: return <Badge variant="default">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
          <p className="text-helper mt-2">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Mentor Applications</h1>
        <p className="text-body">Review and manage mentor applications.</p>
      </div>

      <div className="space-y-6">
        {applications.map((app: any, index: number) => (
          <Card key={app.id} className="card-hover animate-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>{app.fullName}</CardTitle>
                    <CardDescription>{app.user.email}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(app.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Expertise</h4>
                    <p className="text-helper">{app.expertise}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Experience</h4>
                    <p className="text-helper">{app.experience} years</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Background</h4>
                  <p className="text-helper">{app.background}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Proof of Work</h4>
                  <a href={app.proofOfWork} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                    {app.proofOfWork}
                  </a>
                </div>

                <div className="text-sm text-helper">
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleReview(app.id, 'APPROVED')}
                      className="flex-1 bg-success hover:bg-success/80"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReview(app.id, 'NEEDS_INFO', 'Please provide more information')}
                      variant="secondary"
                      className="flex-1"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Need Info
                    </Button>
                    <Button
                      onClick={() => handleReview(app.id, 'REJECTED', 'Application does not meet requirements')}
                      variant="outline"
                      className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-helper mx-auto mb-4" />
            <p className="text-helper">No mentor applications found</p>
          </div>
        )}
      </div>
    </div>
  );
}