"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAccount } from "wagmi";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useFileUpload } from "../../hooks/useFileUpload";
import { toast } from "react-toastify";
import { ConnectKitButton } from "connectkit";
import {
  MessageCircle,
  Shield,
  Users,
  Zap,
  Wallet,
  UserPlus,
  CheckCircle,
  Upload,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function Login() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    profilePicture: null as File | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.profilePicture) {
      newErrors.profilePicture = "Profile picture is required";
    } else if (formData.profilePicture.size > 5 * 1024 * 1024) {
      newErrors.profilePicture = "File size must be less than 5MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Upload profile picture to IPFS via Pinata
      const ipfsCid = await uploadFile(formData.profilePicture!);
      await registerUser(formData.name, formData.username, ipfsCid);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, profilePicture: file });
    if (errors.profilePicture) {
      setErrors({ ...errors, profilePicture: "" });
    }
  };

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Welcome Section */}
        <div className="hidden lg:flex flex-col items-center text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome to WinsomeChat
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience the future of decentralized communication. Connect,
              chat, and build communities in a secure, private environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
            <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border/50">
              <Shield className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold text-sm">Secure & Private</h3>
              <p className="text-xs text-muted-foreground text-center">
                End-to-end encrypted conversations
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border/50">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold text-sm">Group Chats</h3>
              <p className="text-xs text-muted-foreground text-center">
                Create and manage group conversations
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border/50">
              <Zap className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold text-sm">Real-time</h3>
              <p className="text-xs text-muted-foreground text-center">
                Instant messaging with live updates
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-card/50 rounded-lg border border-border/50">
              <Wallet className="w-8 h-8 text-purple-500 mb-2" />
              <h3 className="font-semibold text-sm">Web3 Native</h3>
              <p className="text-xs text-muted-foreground text-center">
                Built on blockchain technology
              </p>
            </div>
          </div>
        </div>

        {/* Login Section */}
        <div className="space-y-6">
          {/* Mobile Welcome Card */}
          <div className="lg:hidden">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold text-foreground">
                    WinsomeChat
                  </h1>
                  <p className="text-muted-foreground">
                    Your decentralized communication platform
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Connection Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                <Wallet className="w-5 h-5" />
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Connect your Web3 wallet to access WinsomeChat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ConnectKitButton
                  customTheme={{
                    "--ck-connectbutton-background": "hsl(var(--primary))",
                    "--ck-connectbutton-color":
                      "hsl(var(--primary-foreground))",
                    "--ck-connectbutton-border-radius": "0.75rem",
                    "--ck-connectbutton-font-size": "1rem",
                    "--ck-connectbutton-font-weight": "600",
                    "--ck-connectbutton-hover-background":
                      "hsl(var(--primary) / 0.9)",
                  }}
                />
              </div>
              {isConnected && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login/Signup Card */}
          {isConnected && (
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-primary">
                  <UserPlus className="w-5 h-5" />
                  {currentProfile?.isRegistered
                    ? "Welcome Back!"
                    : "Create Your Profile"}
                </CardTitle>
                <CardDescription>
                  {currentProfile?.isRegistered
                    ? "Sign in to continue your conversation"
                    : "Complete your registration to start chatting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingCurrentProfile ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">
                      Checking profile...
                    </span>
                  </div>
                ) : currentProfile?.isRegistered ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-center text-green-700 dark:text-green-300 font-medium">
                        Welcome back, {currentProfile.username}!
                      </p>
                    </div>
                    <Button
                      onClick={handleLogin}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label
                        htmlFor="signup-name"
                        className="text-sm font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={`mt-1 ${
                          errors.name ? "border-destructive" : ""
                        }`}
                      />
                      {errors.name && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="signup-username"
                        className="text-sm font-medium"
                      >
                        Username *
                      </Label>
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            username: e.target.value,
                          });
                          if (errors.username)
                            setErrors({ ...errors, username: "" });
                        }}
                        className={`mt-1 ${
                          errors.username ? "border-destructive" : ""
                        }`}
                      />
                      {errors.username && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.username}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="signup-profile-picture"
                        className="text-sm font-medium"
                      >
                        Profile Picture *
                      </Label>
                      <div className="mt-1">
                        <Input
                          id="signup-profile-picture"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className={`hidden ${
                            errors.profilePicture ? "border-destructive" : ""
                          }`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document
                              .getElementById("signup-profile-picture")
                              ?.click()
                          }
                          className="w-full border-dashed border-2 hover:border-primary/50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {formData.profilePicture
                            ? "Change Picture"
                            : "Upload Picture"}
                        </Button>
                        {formData.profilePicture && (
                          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {formData.profilePicture.name}
                          </p>
                        )}
                      </div>
                      {errors.profilePicture && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.profilePicture}
                        </p>
                      )}
                      {isUploading && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      size="lg"
                      disabled={
                        isRegistering || isRegisterConfirming || isUploading
                      }
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : isRegistering ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Profile...
                        </>
                      ) : isRegisterConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Create Profile
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
