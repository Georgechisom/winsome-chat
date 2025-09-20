"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "../../hooks/useWallet";
import { useRouter } from "next/navigation";
import { useGroups } from "@/hooks/useGroups";
import { useUserProfile } from "@/hooks/useUserProfile";
import { usePriceAutomation } from "@/hooks/usePriceAutomation";
import { AuthGuard } from "@/components/AuthGuard";
import {
  Users,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

function DashboardContent() {
  const { address } = useWallet();
  const { fetchGroupChats, chats } = useGroups();
  const { allUsers } = useUserProfile();
  const { currentPrices } = usePriceAutomation();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      fetchGroupChats();
    }
  }, [address, fetchGroupChats]);

  const formatPrice = (price: bigint, decimals: number = 8) => {
    const priceStr = price.toString();
    const wholePart = priceStr.slice(0, -decimals) || "0";
    const decimalPart = priceStr.slice(-decimals).padStart(decimals, "0");
    return `${wholePart}.${decimalPart.slice(0, 2)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Hero Section */}
      <section className="hero-bg flex items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
            Welcome to Winsome Chat
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with your loved ones in a decentralized, secure, and private
            way. Experience the future of messaging with blockchain-powered chat
            technology.
          </p>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Network Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {allUsers.length}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Active users in network
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Active Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {chats.length}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Group chats available
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  ✓
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Decentralized & Secure
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  Web3
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  Powered by blockchain
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Current Prices Section */}
      {currentPrices && (
        <section className="py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12 flex items-center justify-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Live Price Feeds
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    BTC/USD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ${formatPrice(currentPrices.btcUsd)}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Bitcoin price
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ETH/USD
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${formatPrice(currentPrices.ethUsd)}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Ethereum price
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    BTC/ETH
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatPrice(currentPrices.btcEth, 18)} ETH
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    BTC to ETH ratio
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    BNB/ETH
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {formatPrice(currentPrices.bnbEth, 18)} ETH
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    BNB to ETH ratio
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Last updated:{" "}
                {new Date(
                  Number(currentPrices.timestamp) * 1000
                ).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Why Choose Winsome Chat?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Decentralized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built on blockchain technology for true decentralization and
                  censorship resistance.
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Secure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  End-to-end encryption ensures your conversations remain
                  private and secure.
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Web3 Native
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seamlessly integrates with Web3 wallets and decentralized
                  identity systems.
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient-light dark:card-gradient-dark shadow-md hover-scale-brightness rounded-md">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Governed by the community with transparent smart contracts and
                  open-source code.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
