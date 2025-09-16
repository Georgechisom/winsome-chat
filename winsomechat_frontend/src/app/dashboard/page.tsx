"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "../../hooks/useWallet";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useChat } from "../../hooks/useChat";

const mockUsers = [
  { id: 1, name: "Alice", username: "alice123", status: "online" },
  { id: 2, name: "Bob", username: "bob456", status: "offline" },
  { id: 3, name: "Charlie", username: "charlie789", status: "online" },
];

const mockMessages = [
  { id: 1, sender: "Alice", message: "Hey there!", timestamp: "10:30 AM" },
  { id: 2, sender: "You", message: "Hi Alice!", timestamp: "10:31 AM" },
  { id: 3, sender: "Alice", message: "How are you?", timestamp: "10:32 AM" },
];

export default function Dashboard() {
  const { address } = useWallet();
  const { profileByAddress } = useUserProfile();
  const {
    createGroupChat,
    joinGroupChat,
    sendMessage,
    getMessages,
    getUserGroupChats,
    isCreatingGroup,
    isJoiningGroup,
    isSendingMessage,
  } = useChat();

  const [selectedGroupChat, setSelectedGroupChat] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [groupChats, setGroupChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newGroupName, setNewGroupName] = useState("");

  // Load user's group chats
  useEffect(() => {
    if (address) {
      loadUserGroupChats();
    }
  }, [address]);

  // Load messages when group chat is selected
  useEffect(() => {
    if (selectedGroupChat) {
      loadMessages();
    }
  }, [selectedGroupChat]);

  const loadUserGroupChats = async () => {
    if (!address) return;
    try {
      const chats = await getUserGroupChats(address);
      setGroupChats(chats);
      if (chats.length > 0 && !selectedGroupChat) {
        setSelectedGroupChat(chats[0]);
      }
    } catch (error) {
      console.error("Error loading group chats:", error);
    }
  };

  const loadMessages = async () => {
    if (!selectedGroupChat) return;
    try {
      const msgs = await getMessages(selectedGroupChat.groupChatId);
      setMessages(msgs);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      await createGroupChat(newGroupName);
      setNewGroupName("");
      loadUserGroupChats(); // Refresh the list
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleJoinGroup = async (groupChatId: bigint) => {
    try {
      await joinGroupChat(groupChatId);
      loadUserGroupChats(); // Refresh the list
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedGroupChat) return;
    try {
      // For now, use a placeholder IPFS CID - in production, upload message to IPFS
      const contentCid = "QmMessageCID"; // TODO: Implement IPFS upload for messages
      await sendMessage(selectedGroupChat.groupChatId, contentCid);
      setMessage("");
      loadMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-80 bg-card border-r border-border flex flex-col">
        {/* User Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {profileByAddress?.username?.[0] ?? "U"}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {profileByAddress?.username ?? "Your Name"}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{profileByAddress?.username ?? "yourusername"}
              </p>
            </div>
          </div>
        </div>

        {/* Group Chats List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-semibold text-foreground mb-3">Group Chats</h4>
            <div className="space-y-2">
              {groupChats.map((chat) => (
                <div
                  key={chat.groupChatId.toString()}
                  onClick={() => setSelectedGroupChat(chat)}
                  className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                    selectedGroupChat?.groupChatId === chat.groupChatId
                      ? "bg-accent"
                      : ""
                  }`}
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {chat.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{chat.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-2">
              <Input
                placeholder="New group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={handleCreateGroup} disabled={isCreatingGroup}>
                Create
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="p-4 border-b border-border bg-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {selectedGroupChat?.name?.[0] ?? "G"}
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {selectedGroupChat?.name ?? "Select a group"}
              </h2>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender.toLowerCase() === address?.toLowerCase()
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <Card
                className={`max-w-xs ${
                  msg.sender.toLowerCase() === address?.toLowerCase()
                    ? "bg-primary text-primary-foreground"
                    : "card-gradient-light dark:card-gradient-dark"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{msg.contentCid}</p>
                  {/* TODO: Replace contentCid with actual message content from IPFS */}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <footer className="p-4 border-t border-border bg-card">
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isSendingMessage}>
              Send
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
