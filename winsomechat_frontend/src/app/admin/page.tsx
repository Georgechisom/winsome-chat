"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWallet } from "../../hooks/useWallet";
import { usePriceAutomation, PriceData } from "@/hooks/usePriceAutomation";
import { toast } from "react-toastify";
import { AuthGuard } from "@/components/AuthGuard";
import {
  TrendingUp,
  Clock,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  DollarSign,
  Activity,
  Users,
  Timer,
  Shield,
  AlertTriangle,
} from "lucide-react";

function AdminContent() {
  const { address, isConnected } = useWallet();
  const router = useRouter();
  const {
    enabledGroups,
    priceMessages,
    currentPrices,
    timeUntilNextUpdate,
    updateInterval,
    ownerAddress,
    addGroupForFeeds,
    removeGroupForFeeds,
    manualUpdate,
    setUpdateInterval,
    error,
    isSendingMessage,
  } = usePriceAutomation();

  const [newGroupId, setNewGroupId] = useState("");
  const [removeGroupId, setRemoveGroupId] = useState("");
  const [newInterval, setNewInterval] = useState("");

  // Check if current user is admin
  const isAdmin =
    address &&
    ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  // Redirect non-admin users
  useEffect(() => {
    if (isConnected && ownerAddress && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
    }
  }, [isConnected, ownerAddress, isAdmin, router]);

  const handleAddGroup = async () => {
    if (!newGroupId.trim()) return;
    try {
      await addGroupForFeeds(BigInt(newGroupId));
      toast.success(`Group ${newGroupId} added for price feeds`);
      setNewGroupId("");
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Failed to add group for feeds");
    }
  };

  const handleRemoveGroup = async () => {
    if (!removeGroupId.trim()) return;
    try {
      await removeGroupForFeeds(BigInt(removeGroupId));
      toast.success(`Group ${removeGroupId} removed from price feeds`);
      setRemoveGroupId("");
    } catch (error) {
      console.error("Error removing group:", error);
      toast.error("Failed to remove group from feeds");
    }
  };

  const handleManualUpdate = async () => {
    try {
      await manualUpdate();
      toast.success("Manual price update triggered");
    } catch (error) {
      console.error("Error triggering manual update:", error);
      toast.error("Failed to trigger manual update");
    }
  };

  const handleSetInterval = async () => {
    if (!newInterval.trim()) return;
    try {
      await setUpdateInterval(BigInt(newInterval));
      toast.success(`Update interval set to ${newInterval} seconds`);
      setNewInterval("");
    } catch (error) {
      console.error("Error setting interval:", error);
      toast.error("Failed to set update interval");
    }
  };

  const formatPrice = (price: bigint, decimals: number = 8) => {
    const priceStr = price.toString();
    const wholePart = priceStr.slice(0, -decimals) || "0";
    const decimalPart = priceStr.slice(-decimals).padStart(decimals, "0");
    return `${wholePart}.${decimalPart.slice(0, 2)}`;
  };

  const formatTime = (seconds: bigint) => {
    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Show loading state while checking admin status
  if (isConnected && ownerAddress === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (isConnected && ownerAddress && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have admin privileges to access this page.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please connect your wallet to access the admin panel
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Welcome back, Admin! Manage price feeds and automation settings
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Connected as: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Current Prices Overview */}
        {currentPrices && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Control Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Group Management */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                Group Management
              </CardTitle>
              <CardDescription>
                Add or remove groups for price feed automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Add Group to Feeds
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    placeholder="Group ID"
                    onKeyPress={(e) => e.key === "Enter" && handleAddGroup()}
                  />
                  <Button
                    onClick={handleAddGroup}
                    disabled={isSendingMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Remove Group from Feeds
                </label>
                <div className="flex gap-2">
                  <Input
                    value={removeGroupId}
                    onChange={(e) => setRemoveGroupId(e.target.value)}
                    placeholder="Group ID"
                    onKeyPress={(e) => e.key === "Enter" && handleRemoveGroup()}
                  />
                  <Button
                    onClick={handleRemoveGroup}
                    disabled={isSendingMessage}
                    variant="destructive"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Enabled Groups: {enabledGroups.length}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {enabledGroups.map((groupId) => (
                    <span
                      key={groupId.toString()}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                    >
                      {groupId.toString()}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual Update */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <RefreshCw className="w-5 h-5" />
                Manual Price Update
              </CardTitle>
              <CardDescription>
                Trigger immediate price update to all enabled groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleManualUpdate}
                disabled={isSendingMessage}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isSendingMessage ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Trigger Update
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {currentPrices
                    ? new Date(
                        Number(currentPrices.timestamp) * 1000
                      ).toLocaleTimeString()
                    : "Never"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Update Interval Settings */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Timer className="w-5 h-5" />
                Update Settings
              </CardTitle>
              <CardDescription>
                Configure automatic price update intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Set Update Interval (seconds)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newInterval}
                    onChange={(e) => setNewInterval(e.target.value)}
                    placeholder="300"
                    onKeyPress={(e) => e.key === "Enter" && handleSetInterval()}
                  />
                  <Button
                    onClick={handleSetInterval}
                    disabled={isSendingMessage}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Current Interval:
                  </span>
                  <span className="font-medium">
                    {formatTime(updateInterval)} minutes
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Update In:</span>
                  <span className="font-medium">
                    {formatTime(timeUntilNextUpdate)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/20 dark:to-slate-900/20 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {enabledGroups.length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Active Groups
                </div>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {currentPrices ? "✓" : "○"}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Price Feed
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {timeUntilNextUpdate > BigInt(0) ? "⏰" : "✓"}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Auto Update
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
