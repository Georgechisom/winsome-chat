"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "../../hooks/useWallet";
import { useUserProfile, ProfileData } from "../../hooks/useUserProfile";
import { useChat, Message } from "../../hooks/useChat";
import { toast } from "react-hot-toast";
import { getPinataUrl } from "../../lib/pinata";
import { encodePacked, keccak256, Address, isAddress } from "viem";
import { AuthGuard } from "@/components/AuthGuard";

interface PrivateChat {
  chatId: bigint;
  otherUser: ProfileData & { address: string };
}

function ChatsContent() {
  const { address } = useWallet();
  const { getAllUsers, currentProfile, allUsers, isLoadingAllUsers } =
    useUserProfile();
  const {
    sendPrivateMessage,
    fetchPrivateChats,
    fetchMessages,
    searchUser,
    chats,
    messages,
    loading,
    error,
    isSendingPrivateMessage,
    isSendPrivateSuccess,
    sendPrivateError,
    fetchChatMembers,
  } = useChat();

  const [activeTab, setActiveTab] = useState<"chats" | "groups">("chats");
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResult, setSearchResult] = useState<
    (ProfileData & { address: string }) | null
  >(null);
  const [pickedUser, setPickedUser] = useState<
    (ProfileData & { address: string }) | null
  >(null);
  const [activeChat, setActiveChat] = useState<PrivateChat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<
    (ProfileData & { address: string })[]
  >([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const isSending = isSendingPrivateMessage;

  useEffect(() => {
    if (address) {
      console.log("Address connected, fetching users and chats...");
      getAllUsers();
      fetchPrivateChats();
      setActiveTab("chats");
    }
  }, [address, getAllUsers, fetchPrivateChats]);

  useEffect(() => {
    if (isSendPrivateSuccess) {
      toast.success("Message sent!");
      if (activeChat) {
        // Delay to ensure transaction is processed
        setTimeout(() => {
          fetchMessages(activeChat.chatId);
        }, 1000);
      }
      fetchPrivateChats();
    }
  }, [isSendPrivateSuccess, activeChat, fetchMessages, fetchPrivateChats]);

  useEffect(() => {
    if (sendPrivateError) {
      toast.error(`Failed to send message: ${sendPrivateError.message}`);
    }
  }, [sendPrivateError]);

  // FIXED: Filter users based on search query and exclude current user
  useEffect(() => {
    console.log("Filtering users...", {
      allUsersLength: allUsers?.length,
      address,
    });

    if (allUsers && address) {
      const filtered = allUsers
        .filter((user) => {
          // Exclude current user
          if (
            user.address &&
            user.address.toLowerCase() === address.toLowerCase()
          ) {
            console.log("Excluding current user:", user.address);
            return false;
          }
          // Only include registered users
          if (!user.isRegistered) {
            return false;
          }
          return true;
        })
        .filter((user) => {
          // Apply search filter
          if (!userSearchQuery.trim()) return true;
          return (
            user.username
              ?.toLowerCase()
              .includes(userSearchQuery.toLowerCase()) ||
            user.address?.toLowerCase().includes(userSearchQuery.toLowerCase())
          );
        });

      console.log("Filtered users count:", filtered.length);
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [allUsers, address, userSearchQuery]);

  // Better message fetching with proper dependency handling
  useEffect(() => {
    if (activeChat) {
      console.log(`Fetching messages for chat ${activeChat.chatId}`);
      fetchMessages(activeChat.chatId);
    }
  }, [activeChat?.chatId, fetchMessages]);

  const handleSearch = async () => {
    if (!searchAddress.trim()) {
      toast.error("Please enter an address to search");
      return;
    }

    if (!isAddress(searchAddress)) {
      toast.error("Please enter a valid address");
      return;
    }

    setSearchLoading(true);
    setSearchPerformed(true);

    try {
      const result = await searchUser(searchAddress as `0x${string}`);
      if (result && result.isRegistered) {
        setSearchResult({ ...result, address: searchAddress });
        toast.success("User found!");
        console.log("User search result:", result);
      } else {
        setSearchResult(null);
        toast.error("User not found or not registered");
      }
    } catch (error) {
      setSearchResult(null);
      toast.error("Search failed. Please check the address and try again.");
      console.error("Search error:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = async (user: ProfileData & { address: string }) => {
    if (!user.address || !address) {
      toast.error("Invalid user selection");
      return;
    }

    console.log(`Starting private chat with ${user.address}`);

    // Calculate the private chat ID using the deterministic function
    const chatId = getPrivateChatId(
      address as Address,
      user.address as Address
    );

    console.log(`Generated chat ID: ${chatId}`);

    setActiveChat({ chatId, otherUser: user });

    // Fetch messages for this chat
    try {
      const fetchedMessages = await fetchMessages(chatId);
      console.log(`Messages for chat ${chatId}:`, fetchedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!activeChat || !newMessage.trim() || !address) {
      console.log("Cannot send message - missing requirements");
      return;
    }

    const otherUserAddress = activeChat.otherUser.address as `0x${string}`;
    if (!otherUserAddress) {
      toast.error("Recipient address not found.");
      return;
    }

    const messageContent = newMessage.trim();
    console.log(`Sending message to ${otherUserAddress}: ${messageContent}`);

    try {
      sendPrivateMessage(otherUserAddress, messageContent);
      setNewMessage(""); // Clear input immediately
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col lg:flex-row">
      {/* Aside */}
      <aside className="w-full lg:w-1/8 border-r border-border p-4 lg:flex flex-col hidden">
        <div className="mb-4 flex-row">
          <div className="cursor-pointer">
            {currentProfile?.ipfsCid ? (
              <img
                src={getPinataUrl(currentProfile.ipfsCid)}
                alt={`${currentProfile.username} profile photo`}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center mx-auto justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                {currentProfile?.username?.charAt(0).toUpperCase() || "N"}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {currentProfile?.username || "No profile loaded"}
          </h2>
        </div>

        <div className="flex space-x-2 mb-4 my-5">
          <Button variant="default" onClick={() => setActiveTab("chats")}>
            Chats
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/groups")}
          >
            Groups
          </Button>
        </div>

        <div className="overflow-y-auto flex-col mt-5">
          <div className="my-2 font-bold text-lg">All Users</div>

          {/* Search input for filtering users */}
          {/* <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div> */}

          {isLoadingAllUsers ? (
            <div className="text-center text-muted-foreground py-4">
              Loading users...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user.address}
                className={`cursor-pointer p-3 mb-2 ${
                  activeChat?.otherUser.address === user.address
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                } transition-colors`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  {user.ipfsCid ? (
                    <img
                      src={getPinataUrl(user.ipfsCid)}
                      alt={`${user.username} profile`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {userSearchQuery.trim()
                ? "No users found matching your search."
                : allUsers && allUsers.length === 0
                ? "No registered users found."
                : "Loading users..."}
            </p>
          )}
        </div>
      </aside>
      <div className="shadow-md shadow-amber-900 rounded-2xl my-10 p-4 flex flex-col lg:hidden">
        <div className="mb-4 flex-row">
          <div className="cursor-pointer">
            {currentProfile?.ipfsCid ? (
              <img
                src={getPinataUrl(currentProfile.ipfsCid)}
                alt={`${currentProfile.username} profile photo`}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                {currentProfile?.username?.charAt(0).toUpperCase() || "N"}
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold">
            {currentProfile?.username || "No profile loaded"}
          </h2>
        </div>

        <div className="flex space-x-2 mb-4 my-5">
          <Button variant="default" onClick={() => setActiveTab("chats")}>
            Chats
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/groups")}
          >
            Groups
          </Button>
        </div>

        <div className="overflow-y-auto flex-col mt-5">
          <div className="my-2 font-bold text-lg">All Users</div>

          {/* Search input for filtering users */}
          {/* <div className="mb-4">
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="text-sm"
            />
          </div> */}

          {isLoadingAllUsers ? (
            <div className="text-center text-muted-foreground py-4">
              Loading users...
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card
                key={user.address}
                className={`cursor-pointer p-3 mb-2 ${
                  activeChat?.otherUser.address === user.address
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:bg-muted"
                } transition-colors`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  {user.ipfsCid ? (
                    <img
                      src={getPinataUrl(user.ipfsCid)}
                      alt={`${user.username} profile`}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-bold text-sm">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.username || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.address.slice(0, 6)}...{user.address.slice(-4)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {userSearchQuery.trim()
                ? "No users found matching your search."
                : allUsers && allUsers.length === 0
                ? "No registered users found."
                : "Loading users..."}
            </p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <main className="flex flex-col lg:flex-row p-4 gap-y-10 md:gap-x-10">
        {/* Quick search card */}
        <Card className="h-86 mb-4 p-4 w-full lg:w-[600px]">
          <CardTitle className="mb-4">Quick Search</CardTitle>
          <p className="text-sm text-muted-foreground mb-3">
            Need to find a specific user quickly? Search by address here:
          </p>
          <Input
            placeholder="Enter user address to search..."
            className="text-amber-700"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
          />
          <Button
            onClick={handleSearch}
            className="mt-2 w-full text-white"
            disabled={searchLoading}
          >
            {searchLoading ? "Searching..." : "Search User"}
          </Button>
          {searchResult ? (
            <Card className="mt-3 p-3 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {searchResult.ipfsCid ? (
                    <img
                      src={getPinataUrl(searchResult.ipfsCid)}
                      alt={`${searchResult.username} profile`}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {searchResult.username?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-bold">
                      {searchResult.username || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {searchResult.address.slice(0, 10)}...
                      {searchResult.address.slice(-8)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleUserSelect(searchResult)}
                  size="sm"
                >
                  Start Chat
                </Button>
              </div>
            </Card>
          ) : searchPerformed ? (
            <div className="mt-3 p-3 text-center text-muted-foreground bg-muted rounded">
              User not found or not registered.
            </div>
          ) : null}
        </Card>

        {/* Chat card */}
        {activeChat ? (
          <Card className="flex flex-col lg:h-[700px] lg:w-[500px] h-full shadow-md shadow-amber-700 border-amber-700">
            <CardHeader className="border-b-2 border-amber-700 py-4">
              <CardTitle>
                {activeChat.otherUser.username ||
                  `${activeChat.otherUser.address.slice(
                    0,
                    6
                  )}...${activeChat.otherUser.address.slice(-4)}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                ${activeChat.otherUser.address.slice(0, 6)}...$
                {activeChat.otherUser.address.slice(-4)}
              </p>
            </CardHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">
                  Loading messages...
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg: Message, index: number) => (
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
                          : "bg-muted"
                      }`}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm break-words">{msg.contentCid}</p>
                        <small className="text-xs opacity-70 mt-1 block">
                          {new Date(
                            Number(msg.timestamp) * 1000
                          ).toLocaleTimeString()}
                        </small>
                      </CardContent>
                    </Card>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border bg-card">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && !isSending && handleSendMessage()
                  }
                  className="flex-1"
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="text-white"
                >
                  {isSending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="shadow-md shadow-amber-700 p-8 w-full lg:w-[500px] lg:h-[200px] flex items-center justify-center text-center rounded-lg">
            <div>
              <h3 className="text-lg font-semibold mb-2">No Chat Selected</h3>
              <p className="text-muted-foreground">
                Select a user from the sidebar to start chatting, or use the
                quick search to find someone specific.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Chats() {
  return (
    <AuthGuard>
      <ChatsContent />
    </AuthGuard>
  );
}

// More robust private chat ID generation
const getPrivateChatId = (user1: Address, user2: Address): bigint => {
  // Ensure consistent ordering regardless of input order
  const sortedUsers = [user1.toLowerCase(), user2.toLowerCase()].sort();
  const packed = encodePacked(
    ["address", "address"],
    sortedUsers as [`0x${string}`, `0x${string}`]
  );
  const hash = keccak256(packed);
  return BigInt(hash);
};
