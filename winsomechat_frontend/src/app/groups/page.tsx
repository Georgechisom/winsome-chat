"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "../../hooks/useWallet";
import { useChat } from "../../hooks/useChat";

export default function Groups() {
  const { address } = useWallet();
  const {
    createGroupChat,
    joinGroupChat,
    getUserGroupChats,
    isCreatingGroup,
  } = useChat();

  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });

  // Load user's groups
  React.useEffect(() => {
    if (address) {
      loadUserGroups();
    }
  }, [address]);

  const loadUserGroups = async () => {
    try {
      const userGroups = await getUserGroupChats(address);
      setGroups(userGroups);
    } catch (error) {
      console.error("Error loading user groups:", error);
    }
  };

  const handleJoinLeave = async (groupId: bigint, isJoined: boolean) => {
    try {
      if (!isJoined) {
        await joinGroupChat(groupId);
      } else {
        // Leaving group functionality not implemented in contract
        console.warn("Leaving group not supported yet");
      }
      loadUserGroups();
    } catch (error) {
      console.error("Error joining/leaving group:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    try {
      await createGroupChat(newGroup.name);
      setNewGroup({ name: "", description: "" });
      setShowCreateForm(false);
      loadUserGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {showCreateForm ? "Cancel" : "Create Group"}
          </Button>
        </div>

        {/* Create Group Form */}
        {showCreateForm && (
          <Card className="card-gradient-light dark:card-gradient-dark shadow-md rounded-md mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">
                Create New Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="Enter group name"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full" disabled={isCreatingGroup}>
                {isCreatingGroup ? "Creating..." : "Create Group"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card
              key={group.groupChatId.toString()}
              className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
            >
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{group.description ?? ""}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {group.members ?? 0} members
                  </span>
                  <Button
                    onClick={() => handleJoinLeave(group.groupChatId, group.isJoined)}
                    variant={group.isJoined ? "outline" : "default"}
                    size="sm"
                  >
                    {group.isJoined ? "Leave" : "Join"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
