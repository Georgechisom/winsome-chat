"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "../../hooks/useWallet";
import { useRouter } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";

export default function Dashboard() {
  const { address } = useWallet();
  const { fetchGroupChats, chats } = useGroups();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      fetchGroupChats();
    }
  }, [address, fetchGroupChats]);

  return (
    <div className="flex flex-col min-h-full bg-gray-100 dark:bg-background">
      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Left Side - Dashboard Content */}
        <div className="flex-1 flex flex-col">
          {/* Welcome Header */}
          <header className="text-center py-12 px-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Winsome Chat
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with your loved ones in a decentralized, secure, and
              private way. Experience the future of messaging with
              blockchain-powered chat technology.
            </p>
          </header>

          {/* Welcome Cards */}
          <div className="flex-1 flex items-center justify-center p-8 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
              <Card
                className="card-gradient-light dark:card-gradient-dark hover-scale-brightness cursor-pointer"
                onClick={() => router.push("/chats")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    💕
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Chat with Loved Ones
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Connect and chat with your friends and family in a
                    decentralized way.
                  </p>
                  <Button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white">
                    Start Chatting 💬
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="card-gradient-light dark:card-gradient-dark hover-scale-brightness cursor-pointer"
                onClick={() => router.push("/profiles")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    ✨
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Your Beautiful Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    View and update your profile to look amazing and share your
                    story.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    View Profile 🌟
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-gradient-light dark:card-gradient-dark hover-scale-brightness">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    👥
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">0</p>
                  <p className="text-muted-foreground">
                    Active users in the network
                  </p>
                </CardContent>
              </Card>

              <Card className="card-gradient-light dark:card-gradient-dark hover-scale-brightness">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    💬
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Active Chats
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-primary mb-2">
                    {chats.length}
                  </p>
                  <p className="text-muted-foreground">Group chats available</p>
                </CardContent>
              </Card>

              <Card
                className="card-gradient-light dark:card-gradient-dark hover-scale-brightness cursor-pointer"
                onClick={() => router.push("/groups")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    👥
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Manage Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Create and manage your group chats
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    Manage Groups 📋
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-gradient-light dark:card-gradient-dark hover-scale-brightness">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    📊
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Network Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-2">
                    Decentralized & Secure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Powered by blockchain technology
                  </p>
                </CardContent>
              </Card>

              {/* Additional Navigation Cards */}
              <Card
                className="card-gradient-light dark:card-gradient-dark hover-scale-brightness cursor-pointer"
                onClick={() => router.push("/chats")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    💬
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Go to Chats
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Access your chat interface and start messaging.
                  </p>
                  <Button className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white">
                    Open Chats 📱
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="card-gradient-light dark:card-gradient-dark hover-scale-brightness cursor-pointer"
                onClick={() => router.push("/profiles")}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                    👤
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Go to Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Manage your profile and view others' profiles.
                  </p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                    Open Profiles 👥
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
