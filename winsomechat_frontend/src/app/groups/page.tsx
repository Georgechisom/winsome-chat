"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "../../hooks/useWallet";
import { useGroups } from "../../hooks/useGroups";
import { getProfileByAddress } from "../../lib/chatMessaging";

export default function Groups() {
  const { address } = useWallet();
  const {
    createGroupChat,
    joinGroupChat,
    leaveGroupChat,
    fetchGroupChats,
    fetchAllGroups,
    fetchMessages,
    fetchGroupMemberCount,
    sendMessage,
    chats,
    allGroups,
    messages,
    selectedGroup,
    setSelectedGroup,
    selectedGroupMemberCount,
    isCreatingGroup,
    isJoiningGroup,
    isJoinGroupSuccess,
    isLeavingGroup,
    isSendingMessage,
    isLeaveGroupSuccess,
    isSendMessageSuccess,
  } = useGroups();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [joiningGroups, setJoiningGroups] = useState<Set<bigint>>(new Set());
  const [leavingGroups, setLeavingGroups] = useState<Set<bigint>>(new Set());
  const [senderUsernames, setSenderUsernames] = useState<
    Record<string, string>
  >({});

  // Load user's groups and all groups
  useEffect(() => {
    if (address) {
      fetchGroupChats();
      fetchAllGroups();
    }
  }, [address, fetchGroupChats, fetchAllGroups]);

  // Load messages and member count when group is selected
  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.groupChatId);
      fetchGroupMemberCount(selectedGroup.groupChatId);
    }
  }, [selectedGroup, fetchMessages, fetchGroupMemberCount]);

  // After sending a message, refetch messages
  useEffect(() => {
    if (isSendMessageSuccess && selectedGroup) {
      fetchMessages(selectedGroup.groupChatId);
    }
  }, [isSendMessageSuccess, selectedGroup, fetchMessages]);

  // Fetch usernames for message senders
  useEffect(() => {
    const fetchUsernames = async () => {
      const usernamesToFetch = messages
        .map((msg) => msg.sender)
        .filter((sender) => !senderUsernames[sender]);

      if (usernamesToFetch.length === 0) return;

      const uniqueSenders = [...new Set(usernamesToFetch)];
      const newProfiles: Record<string, string> = {};

      await Promise.all(
        uniqueSenders.map(async (sender) => {
          const profile = await getProfileByAddress(sender);
          if (profile && profile.isRegistered) {
            newProfiles[sender] = profile.username;
          }
        })
      );

      if (Object.keys(newProfiles).length > 0) {
        setSenderUsernames((prev) => ({ ...prev, ...newProfiles }));
      }
    };

    if (messages.length > 0) {
      fetchUsernames();
    }
  }, [messages, senderUsernames]);

  // After joining or leaving a group, refetch group lists and member count
  useEffect(() => {
    if (isJoinGroupSuccess || isLeaveGroupSuccess) {
      fetchGroupChats();
      fetchAllGroups();
      if (selectedGroup) {
        fetchGroupMemberCount(selectedGroup.groupChatId);
      }
    }
  }, [
    isJoinGroupSuccess,
    isLeaveGroupSuccess,
    fetchGroupChats,
    fetchAllGroups,
    selectedGroup,
    fetchGroupMemberCount,
  ]);

  const handleJoinLeave = (groupId: bigint, isJoined: boolean) => {
    try {
      if (!isJoined) {
        joinGroupChat(groupId);
      } else {
        leaveGroupChat(groupId);
        if (selectedGroup?.groupChatId === groupId) {
          setSelectedGroup(null); // Deselect if leaving current group
        }
      }
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
      fetchGroupChats();
      fetchAllGroups();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedGroup || !newMessage.trim()) return;
    const messageToSend = newMessage;
    setNewMessage(""); // Clear input immediately for UX
    try {
      await sendMessage(selectedGroup.groupChatId, messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(messageToSend);
    }
  };

  const isUserInGroup = (groupId: bigint) => {
    return chats.some((chat) => chat.groupChatId === groupId);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-primary hover:bg-primary/90 text-white"
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
              <Button
                onClick={handleCreateGroup}
                className="w-full text-white"
                disabled={isCreatingGroup}
              >
                {isCreatingGroup ? "Creating..." : "Create Group"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-4rem)]">
          {/* Aside Top */}
          <div className="lg:w-1/4 flex-shrink-0">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Groups You Are In
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-6rem)] space-y-4">
              {chats.length === 0 ? (
                <p className="text-muted-foreground">You are not in any groups.</p>
              ) : (
                chats.map((group) => (
                  <Card
                    key={group.groupChatId.toString()}
                    className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <Button
                          onClick={() => setSelectedGroup(group)}
                          variant="default"
                          size="sm"
                          className="text-white"
                        >
                          Chat
                        </Button>
                        <Button
                          onClick={() => handleJoinLeave(group.groupChatId, true)}
                          variant="outline"
                          size="sm"
                          disabled={leavingGroups.has(group.groupChatId)}
                          className="bg-red-600"
                        >
                          {leavingGroups.has(group.groupChatId) ? "Leaving..." : "Leave"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Others Follow */}
          <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
            {/* All Groups */}
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4 my-5">
                All Groups
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto">
                {allGroups.map((group) => {
                  const isMember = isUserInGroup(group.groupChatId);
                  return (
                    <Card
                      key={group.groupChatId.toString()}
                      className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">
                          {group.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {isMember ? (
                          <Button
                            onClick={() => setSelectedGroup(group)}
                            variant="default"
                            size="sm"
                            className="text-white"
                          >
                            Chat
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleJoinLeave(group.groupChatId, false)}
                            variant="default"
                            size="sm"
                            disabled={joiningGroups.has(group.groupChatId)}
                            className="text-white"
                          >
                            {joiningGroups.has(group.groupChatId) ? "Joining..." : "Join"}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              <Card className="card-gradient-light dark:card-gradient-dark mb-10 shadow-md shadow-amber-500 rounded-md flex flex-col h-full">
                <CardHeader className="border-b-2 border-b-primary py-4">
                  <CardTitle className="text-xl font-semibold text-foreground ">
                    {selectedGroup ? selectedGroup.name : "Group Chat"}
                  </CardTitle>
                  {selectedGroup && (
                    <p className="text-sm text-muted-foreground">
                      Members: {selectedGroupMemberCount.toString()}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col flex-1 overflow-y-auto space-y-2 mb-4">
                  {!selectedGroup ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        Click on any group at the other side to chat
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg, index) => (
                        <div
                          key={`${msg.timestamp}-${index}`}
                          className={`p-2 rounded-md ${
                            msg.sender === address
                              ? "bg-primary text-primary-foreground ml-auto text-right bg-green"
                              : "bg-muted text-muted-foreground text-left"
                          } max-w-xs`}
                        >
                          <p className="text-xs">
                            {senderUsernames[msg.sender] ||
                              `${msg.sender.slice(0, 6)}...${msg.sender.slice(-4)}`}
                          </p>
                          <p className="text-sm text-black font-semibold py-1">
                            {msg.content}
                          </p>
                          <p className="text-xs text-right opacity-70">
                            {new Date(Number(msg.timestamp) * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
                {selectedGroup && (
                  <div className="flex space-x-2 p-4 border-t border-t-primary">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      disabled={isSendingMessage}
                      className="text-white"
                    >
                      {isSendingMessage ? "Sending..." : "Send"}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
