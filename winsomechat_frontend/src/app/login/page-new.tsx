"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFileUpload } from "../../hooks/useFileUpload";

export default function Login() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    profilePicture: null as File | null,
  });
  const [error, setError] = useState("");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [isProfileChecked, setIsProfileChecked] = useState(false);

  // Contract hooks
  const {
    registerUser,
    isRegistering,
    isRegisterConfirming,
    isRegisterSuccess,
    profileByAddress,
    getProfileByAddress,
  } = useUserProfile();

  // File upload hook
  const {
    uploadFile,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useFileUpload();

  // Check if user is registered when wallet is connected
  useEffect(() => {
    const checkProfile = async () => {
      if (address) {
        setIsCheckingProfile(true);
        try {
          await getProfileByAddress(address);
        } catch (error) {
          console.error("Error checking profile:", error);
          setError("Failed to check profile status");
        } finally {
          setIsCheckingProfile(false);
          setIsProfileChecked(true);
        }
      }
    };
    checkProfile();
  }, [address, getProfileByAddress]);

  // Redirect to dashboard on successful registration
  useEffect(() => {
    if (isRegisterSuccess) {
      router.push("/dashboard");
    }
  }, [isRegisterSuccess, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isConnected) {
      setError("Please connect your wallet first.");
      setIsLogin(false);
      return;
    }

    if (isLogin) {
      // Login logic - check if user is registered
      if (profileByAddress?.isRegistered) {
        router.push("/dashboard");
      } else {
        setError("User not registered. Please sign up first.");
        setIsLogin(false); // Switch to signup form
      }
    } else {
      // Signup logic
      if (!formData.name || !formData.username || !formData.profilePicture) {
        setError("Please fill in all fields including profile picture.");
        return;
      }

      try {
        // Upload profile picture to IPFS via Pinata
        const ipfsCid = await uploadFile(formData.profilePicture);
        await registerUser(formData.name, formData.username, ipfsCid);
      } catch (error) {
        console.error("Registration error:", error);
        setError("Registration failed. Please try again.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profilePicture: file });
  };

  useEffect(() => {
    // Reset form when switching between login/signup
    setFormData({ name: "", username: "", profilePicture: null });
    setError("");
  }, [isLogin]);

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
              {isCheckingProfile && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Checking profile status...
                </p>
              )}
              {profileByAddress && (
                <p className="text-center text-sm mt-2">
                  {profileByAddress.isRegistered ? (
                    <span className="text-green-600">✓ Profile registered</span>
                  ) : (
                    <span className="text-orange-600">⚠ Profile not found</span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Login/Signup Cards */}
        {isConnected && isProfileChecked && (
          <>
            {/* Login Card */}
            <Card
              className={`card-gradient-light dark:card-gradient-dark shadow-md rounded-md transition-transform duration-500 ${
                isLogin ? "translate-x-0" : "-translate-x-full opacity-0"
              }`}
              style={{ display: isLogin ? "block" : "none" }}
            >
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-foreground">
                  Login
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isCheckingProfile ? (
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Loading profile...
                      </p>
                    </div>
                  ) : profileByAddress?.isRegistered ? (
                    <div className="text-center">
                      <p className="text-green-600 mb-4">
                        Welcome back, {profileByAddress.username}!
                      </p>
                      <Button type="submit" className="w-full">
                        Continue to Dashboard
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        No account found. Please sign up first.
                      </p>
                      <Button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="w-full"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Signup Card */}
            <Card
              className={`card-gradient-light dark:card-gradient-dark shadow-md rounded-md transition-transform duration-500 ${
                !isLogin ? "translate-x-0" : "translate-x-full opacity-0"
              }`}
              style={{ display: !isLogin ? "block" : "none" }}
            >
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-foreground">
                  Sign Up
                </CardTitle>
              </CardHeader>
              <CardContent>
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
                  <p className="text-center text-sm text-muted-foreground">
                    Have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-primary hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
