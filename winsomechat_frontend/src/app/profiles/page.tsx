"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserProfile, ProfileData } from "../../hooks/useUserProfile";
import { toast } from "react-toastify";
import { getPinataUrl } from "../../lib/pinata";
import { AuthGuard } from "@/components/AuthGuard";

function ProfilesContent() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { getAllUsers, isLoadingAllUsers } = useUserProfile();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers();
        if (users) {
          setProfiles(users);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch user profiles.");
      }
    };
    fetchUsers();
  }, [getAllUsers]);

  const filteredProfiles = profiles.filter((profile) =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Search by username..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Profiles Grid */}
        {isLoadingAllUsers ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile, index) => (
              <Card
                key={index}
                className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
              >
                <CardHeader className="text-center">
                  {profile.ipfsCid ? (
                    <img
                      src={getPinataUrl(profile.ipfsCid)}
                      alt={`${profile.username} profile photo`}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {profile.username}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-center">
                    IPFS CID: {profile.ipfsCid.slice(0, 10)}...
                  </p>
                  <Button variant={"default"} className="w-full">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoadingAllUsers && filteredProfiles.length === 0 && (
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

export default function Profiles() {
  return (
    <AuthGuard>
      <ProfilesContent />
    </AuthGuard>
  );
}
