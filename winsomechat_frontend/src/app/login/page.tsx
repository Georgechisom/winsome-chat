"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFileUpload } from "../../hooks/useFileUpload";
import { toast } from "react-toastify";
import { ConnectKitButton } from "connectkit";

export default function Login() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    profilePicture: null as File | null,
  });
  const [error, setError] = useState("");

  // Contract hooks
  const {
    registerUser,
    isRegistering,
    isRegisterConfirming,
    isRegisterSuccess,
    currentProfile,
    isLoadingCurrentProfile,
  } = useUserProfile();
  const {
    uploadFile,
    isUploading,
    uploadProgress,
    error: uploadError,
    successMessage,
  } = useFileUpload();

  // Redirect to dashboard on successful registration
  useEffect(() => {
    if (isRegisterSuccess) {
      toast.success("Registration successful! Redirecting to dashboard...");
      router.push("/dashboard");
    }
  }, [isRegisterSuccess, router]);

  // Show toast for file upload success or error
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  useEffect(() => {
    if (uploadError) {
      toast.error(uploadError);
    }
  }, [uploadError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected) {
      setError("Please connect your wallet first.");
      toast.error("Please connect your wallet first.");
      return;
    }

    // Signup logic
    if (!formData.name || !formData.username || !formData.profilePicture) {
      setError("Please fill in all fields including profile picture.");
      toast.error("Please fill in all fields including profile picture.");
      return;
    }

    try {
      // Upload profile picture to IPFS via Pinata
      const ipfsCid = await uploadFile(formData.profilePicture);
      await registerUser(formData.name, formData.username, ipfsCid);
    } catch (error) {
      console.error("Registration error:", error);
      setError("Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profilePicture: file });
  };

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        {/* Wallet Connection */}
        {!isConnected ? (
          <Card className="card-gradient-light dark:card-gradient-dark shadow-md rounded-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">
                Connect Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ConnectKitButton />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-gradient-light dark:card-gradient-dark shadow-md rounded-md">
            <CardContent className="pt-6">
              <div className="flex justify-center mb-4">
                <ConnectKitButton />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Login or Sign Up Card */}
        {isConnected && (
          <Card className="card-gradient-light dark:card-gradient-dark shadow-md rounded-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">
                Login or Sign Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCurrentProfile ? (
                <p className="text-center text-sm text-muted-foreground">
                  Checking profile status...
                </p>
              ) : currentProfile?.isRegistered ? (
                <div className="space-y-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Welcome back, {currentProfile.username}!
                  </p>
                  <Button onClick={handleLogin} className="w-full text-white">
                    Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name">Name *</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-profile-picture">
                      Profile Picture *
                    </Label>
                    <Input
                      id="signup-profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mt-1"
                      required
                    />
                    {formData.profilePicture && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {formData.profilePicture.name}
                      </p>
                    )}
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  {(error || uploadError) && (
                    <p className="text-destructive text-sm">
                      {error || uploadError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      isRegistering || isRegisterConfirming || isUploading
                    }
                  >
                    {isUploading
                      ? "Uploading..."
                      : isRegistering
                      ? "Registering..."
                      : isRegisterConfirming
                      ? "Confirming..."
                      : "Sign Up"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
