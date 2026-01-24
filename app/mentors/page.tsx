"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, MessageCircle, CheckCircle, Users, ArrowLeft } from "lucide-react";

// Mock mentor data
const mockMentors = [
  {
    id: "1",
    name: "Sarah Chen",
    title: "Former VP of Product at Stripe",
    expertise: ["Product Development", "Strategy", "Fundraising"],
    reputation: 2450,
    solutionsCount: 89,
    rating: 4.9,
    responseTime: "< 2 hours",
    bio: "10+ years building products at scale. Helped 50+ startups with product-market fit and growth strategies.",
    isPremium: true,
    isVerified: true
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    title: "Serial Entrepreneur & Angel Investor",
    expertise: ["Fundraising", "Strategy", "Operations"],
    reputation: 1890,
    solutionsCount: 67,
    rating: 4.8,
    responseTime: "< 4 hours",
    bio: "Founded 3 companies (2 exits). Now helping early-stage founders navigate the startup journey.",
    isPremium: true,
    isVerified: true
  },
  {
    id: "3",
    name: "Alex Thompson",
    title: "Head of Engineering at Notion",
    expertise: ["Technology", "Hiring", "Operations"],
    reputation: 1650,
    solutionsCount: 45,
    rating: 4.7,
    responseTime: "< 6 hours",
    bio: "Built engineering teams from 5 to 150+ people. Expert in scaling technical organizations.",
    isPremium: false,
    isVerified: true
  },
  {
    id: "4",
    name: "Lisa Park",
    title: "Growth Marketing Expert",
    expertise: ["Marketing", "Strategy"],
    reputation: 1200,
    solutionsCount: 78,
    rating: 4.6,
    responseTime: "< 8 hours",
    bio: "Scaled user acquisition for 20+ B2B SaaS companies. Specialized in product-led growth.",
    isPremium: false,
    isVerified: true
  }
];

const expertiseAreas = [
  "All Areas",
  "Product Development",
  "Marketing",
  "Fundraising",
  "Operations",
  "Hiring",
  "Legal",
  "Technology",
  "Strategy"
];

export default function MentorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("All Areas");
  const [mentors] = useState(mockMentors);

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = selectedExpertise === "All Areas" || 
                            mentor.expertise.includes(selectedExpertise);
    
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="p-6 animate-fade-in">
      <Button 
        variant="secondary" 
        onClick={() => router.back()}
        className="mb-6 transform hover:scale-105 transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8 animate-slide-in">
        <h1 className="text-h1 mb-2">Find Mentors</h1>
        <p className="text-body">Connect with experienced entrepreneurs and industry experts who can guide your journey.</p>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6 card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-transform hover:scale-110" />
              <Input
                placeholder="Search mentors by name, title, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all focus:scale-105"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="w-full p-2 border border-border rounded-lg transition-all hover:border-accent focus:border-accent"
              >
                {expertiseAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 stagger-children">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-accent mr-3 transition-transform hover:scale-110" />
              <div>
                <div className="text-2xl font-bold">{mentors.length}</div>
                <p className="text-sm text-helper">Active Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-success mr-3 transition-transform hover:scale-110" />
              <div>
                <div className="text-2xl font-bold">279</div>
                <p className="text-sm text-helper">Solutions Provided</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-warning mr-3 transition-transform hover:scale-110" />
              <div>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-sm text-helper">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
        {filteredMentors.map((mentor, index) => (
          <Card key={mentor.id} className="hover:shadow-sm transition-all card-hover animate-slide-in" style={{animationDelay: `${0.1 * index}s`}}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    {mentor.isVerified && (
                      <Badge variant="verified" className="animate-pulse">Verified</Badge>
                    )}
                    {mentor.isPremium && (
                      <Badge variant="premium" className="animate-pulse">Premium</Badge>
                    )}
                  </div>
                  <CardDescription>{mentor.title}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-warning fill-current" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                  <p className="text-xs text-helper">{mentor.responseTime}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-helper mb-4">{mentor.bio}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {mentor.expertise.map((skill, skillIndex) => (
                  <Badge key={skill} variant="default" className="text-xs animate-fade-in" style={{animationDelay: `${skillIndex * 0.1}s`}}>
                    {skill}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-helper mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{mentor.solutionsCount} solutions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{mentor.reputation} reputation</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1 transform hover:scale-105 transition-all">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask Question
                </Button>
                <Button variant="secondary" className="transform hover:scale-105 transition-all">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card className="animate-fade-in">
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h3 className="font-medium mb-2">No mentors found</h3>
            <p className="text-helper">
              Try adjusting your search terms or expertise filter to find relevant mentors.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}