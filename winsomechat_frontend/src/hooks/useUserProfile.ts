import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  usePublicClient,
} from "wagmi";
import { useState, useCallback, useEffect } from "react";
import userProfileABI from "../ABI/UserProfiles_Abi.json";

// Contract address from env
const USER_PROFILE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`;

export interface ProfileData {
  username: string;
  ipfsCid: string;
  isRegistered: boolean;
  address?: string;
}

export const useUserProfile = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSettingProfile, setIsSettingProfile] = useState(false);
  const [allUsers, setAllUsers] = useState<
    (ProfileData & { address: string })[]
  >([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);

  // Write hooks
  const { writeContract: writeRegister, data: registerHash } =
    useWriteContract();
  const { writeContract: writeSetProfile, data: setProfileHash } =
    useWriteContract();

  // Transaction receipts
  const { isLoading: isRegisterConfirming, isSuccess: isRegisterSuccess } =
    useWaitForTransactionReceipt({ hash: registerHash });
  const { isLoading: isSetProfileConfirming, isSuccess: isSetProfileSuccess } =
    useWaitForTransactionReceipt({ hash: setProfileHash });

  // Read hook for current user profile
  const {
    data: currentProfile,
    refetch: refetchCurrentProfile,
    isLoading: isLoadingCurrentProfile,
  } = useReadContract({
    address: USER_PROFILE_CONTRACT_ADDRESS,
    abi: userProfileABI,
    functionName: "getProfileByAddress",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!USER_PROFILE_CONTRACT_ADDRESS,
    },
  });

  const registerUser = useCallback(
    async (name: string, username: string, ipfsCid: string) => {
      if (!USER_PROFILE_CONTRACT_ADDRESS)
        throw new Error("Contract address not set");

      setIsRegistering(true);
      try {
        await writeRegister({
          address: USER_PROFILE_CONTRACT_ADDRESS,
          abi: userProfileABI,
          functionName: "registerWinsomeName",
          args: [name, username, ipfsCid],
        });

        return { success: true };
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      } finally {
        setIsRegistering(false);
      }
    },
    [writeRegister]
  );

  const setUserProfile = useCallback(
    async (username: string, ipfsCid: string, winsomeName: string) => {
      if (!USER_PROFILE_CONTRACT_ADDRESS)
        throw new Error("Contract address not set");

      setIsSettingProfile(true);
      try {
        await writeSetProfile({
          address: USER_PROFILE_CONTRACT_ADDRESS,
          abi: userProfileABI,
          functionName: "setProfile",
          args: [username, ipfsCid, winsomeName],
        });
      } catch (error) {
        console.error("Set profile failed:", error);
        throw error;
      } finally {
        setIsSettingProfile(false);
      }
    },
    [writeSetProfile]
  );

  const getAllUsers = useCallback(async () => {
    if (!USER_PROFILE_CONTRACT_ADDRESS || !publicClient) {
      console.error("Contract address or public client not available");
      return [];
    }

    setIsLoadingAllUsers(true);
    try {
      console.log("Fetching all users...");

      // Get all users
      const usersResult = await publicClient.readContract({
        address: USER_PROFILE_CONTRACT_ADDRESS,
        abi: userProfileABI,
        functionName: "getAllUsers",
      });

      const users = usersResult as ProfileData[];
      console.log("Raw users data:", users);

      // Get total users to fetch addresses
      const totalUsersResult = await publicClient.readContract({
        address: USER_PROFILE_CONTRACT_ADDRESS,
        abi: userProfileABI,
        functionName: "getTotalUsers",
      });

      const totalUsers = Number(totalUsersResult);
      console.log("Total users:", totalUsers);

      // Fetch addresses
      const addresses: string[] = [];
      for (let i = 0; i < totalUsers; i++) {
        const addrResult = await publicClient.readContract({
          address: USER_PROFILE_CONTRACT_ADDRESS,
          abi: userProfileABI,
          functionName: "userAddresses",
          args: [BigInt(i)],
        });
        addresses.push(addrResult as string);
      }

      console.log("Addresses:", addresses);

      if (users && users.length === addresses.length) {
        const combinedUsers = users.map((user, index) => ({
          ...user,
          address: addresses[index],
        }));

        // Deduplicate by address
        const uniqueUsers = combinedUsers.filter(
          (user, index, self) =>
            index === self.findIndex((u) => u.address === user.address)
        );

        console.log("Combined unique users:", uniqueUsers);
        setAllUsers(uniqueUsers);
        return uniqueUsers;
      } else {
        console.warn("Users and addresses length mismatch", {
          usersLength: users?.length,
          addressesLength: addresses.length,
        });

        // Fallback
        const fallbackUsers =
          users?.map((user) => ({
            ...user,
            address: `unknown-${user.username}`,
          })) || [];

        setAllUsers(fallbackUsers);
        return fallbackUsers;
      }
    } catch (error) {
      console.error("Error fetching all users:", error);
      setAllUsers([]);
      return [];
    } finally {
      setIsLoadingAllUsers(false);
    }
  }, [publicClient]);

  // Auto-fetch users when component mounts
  useEffect(() => {
    if (USER_PROFILE_CONTRACT_ADDRESS && publicClient) {
      getAllUsers();
    }
  }, [getAllUsers, publicClient]);

  // Refetch users when registration is successful
  useEffect(() => {
    if (isRegisterSuccess || isSetProfileSuccess) {
      setTimeout(() => {
        getAllUsers();
        refetchCurrentProfile();
      }, 2000);
    }
  }, [
    isRegisterSuccess,
    isSetProfileSuccess,
    getAllUsers,
    refetchCurrentProfile,
  ]);

  return {
    // Registration functions
    registerUser,
    isRegistering,
    isRegisterConfirming,
    isRegisterSuccess,

    // Profile setting functions
    setUserProfile,
    isSettingProfile,
    isSetProfileConfirming,
    isSetProfileSuccess,

    // User fetching functions
    getAllUsers,
    allUsers,
    isLoadingAllUsers,

    // Current user profile
    currentProfile: currentProfile as ProfileData | undefined,
    refetchCurrentProfile,
    isLoadingCurrentProfile,

    // Contract info
    USER_PROFILE_CONTRACT_ADDRESS,
  };
};
