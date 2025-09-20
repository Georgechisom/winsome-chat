"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { Loader2, Shield, Wallet, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

export function AuthGuard({ children, requireProfile = true }: AuthGuardProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { currentProfile, isLoadingCurrentProfile } = useUserProfile();

  useEffect(() => {
    if (!isConnected) {
      return; // Don't redirect, show wallet connection UI instead
    }

    if (
      requireProfile &&
      !isLoadingCurrentProfile &&
      !currentProfile?.isRegistered
    ) {
      router.push("/login");
      return;
    }
  }, [
    isConnected,
    currentProfile,
    isLoadingCurrentProfile,
    requireProfile,
    router,
  ]);

  // Show wallet connection UI if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md card-gradient-light dark:card-gradient-dark shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-4 mx-auto">
              <Wallet className="w-10 h-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Connect Your Wallet
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Connect your Web3 wallet to access Winsome Chat and start
              messaging securely.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <ConnectKitButton.Custom>
                  {({ isConnected, show, truncatedAddress, ensName }) => {
                    return (
                      <Button
                        onClick={show}
                        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        size="lg"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        {isConnected
                          ? `Connected: ${ensName ?? truncatedAddress}`
                          : "Connect Wallet"}
                      </Button>
                    );
                  }}
                </ConnectKitButton.Custom>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-1 text-green-500" />
                    Secure
                  </div>
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-1 text-blue-500" />
                    Private
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your wallet is your identity in the decentralized web
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking profile
  if (requireProfile && isLoadingCurrentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <h2 className="text-xl font-semibold mb-2">
                  Verifying Profile
                </h2>
                <p className="text-muted-foreground">
                  Checking your profile status...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isConnected || (requireProfile && !currentProfile?.isRegistered)) {
    return null;
  }

  return <>{children}</>;
}
