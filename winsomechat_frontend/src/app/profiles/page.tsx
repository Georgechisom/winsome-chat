"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const mockProfiles = [
  {
    id: 1,
    name: "Alice Johnson",
    username: "alice123",
    bio: "Blockchain enthusiast and Web3 developer",
    avatar: "A",
    isFollowing: false,
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "bob456",
    bio: "Crypto trader and market analyst",
    avatar: "B",
    isFollowing: true,
  },
  {
    id: 3,
    name: "Charlie Brown",
    username: "charlie789",
    bio: "Smart contract auditor and security expert",
    avatar: "C",
    isFollowing: false,
  },
];

export default function Profiles() {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFollowToggle = (profileId: number) => {
    setProfiles(
      profiles.map((profile) =>
        profile.id === profileId
          ? { ...profile, isFollowing: !profile.isFollowing }
          : profile
      )
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Profiles</h1>
          <div className="max-w-md">
            <Label htmlFor="search">Search Profiles</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or username..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((profile) => (
            <Card
              key={profile.id}
              className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                  {profile.avatar}
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {profile.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  {profile.bio}
                </p>
                <Button
                  onClick={() => handleFollowToggle(profile.id)}
                  variant={profile.isFollowing ? "outline" : "default"}
                  className="w-full"
                >
                  {profile.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No profiles found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
