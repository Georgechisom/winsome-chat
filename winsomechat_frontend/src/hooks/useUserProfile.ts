import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState } from "react";

// UserProfile contract ABI
const userProfileABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_username",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsCid",
        type: "string",
      },
    ],
    name: "registerWinsomeName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_username",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsCid",
        type: "string",
      },
      {
        internalType: "string",
        name: "_winsomeName",
        type: "string",
      },
    ],
    name: "setProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getProfileByAddress",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsCid",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isRegistered",
            type: "bool",
          },
        ],
        internalType: "struct UserProfile.ProfileData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_winsomeName",
        type: "string",
      },
    ],
    name: "getProfileByWinsomeName",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsCid",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isRegistered",
            type: "bool",
          },
        ],
        internalType: "struct UserProfile.ProfileData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsers",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "username",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsCid",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isRegistered",
            type: "bool",
          },
        ],
        internalType: "struct UserProfile.ProfileData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Contract address - should be set via environment variable
const USER_PROFILE_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`;

export interface ProfileData {
  username: string;
  ipfsCid: string;
  isRegistered: boolean;
}

export const useUserProfile = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSettingProfile, setIsSettingProfile] = useState(false);

  // Write contract hooks
  const { writeContract: writeRegister, data: registerHash } =
    useWriteContract();
  const { writeContract: writeSetProfile, data: setProfileHash } =
    useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isRegisterConfirming, isSuccess: isRegisterSuccess } =
    useWaitForTransactionReceipt({
      hash: registerHash,
    });

  const { isLoading: isSetProfileConfirming, isSuccess: isSetProfileSuccess } =
    useWaitForTransactionReceipt({
      hash: setProfileHash,
    });

  // Read contract hooks
  const { data: profileByAddress, refetch: refetchProfileByAddress } =
    useReadContract({
      address: USER_PROFILE_CONTRACT_ADDRESS,
      abi: userProfileABI,
      functionName: "getProfileByAddress",
    });

  const { data: allUsers, refetch: refetchAllUsers } = useReadContract({
    address: USER_PROFILE_CONTRACT_ADDRESS,
    abi: userProfileABI,
    functionName: "getAllUsers",
  });

  const registerUser = async (
    name: string,
    username: string,
    ipfsCid: string
  ) => {
    if (!USER_PROFILE_CONTRACT_ADDRESS) {
      throw new Error("UserProfile contract address not configured");
    }

    setIsRegistering(true);
    try {
      await writeRegister({
        address: USER_PROFILE_CONTRACT_ADDRESS,
        abi: userProfileABI,
        functionName: "registerWinsomeName",
        args: [name, username, ipfsCid],
      });
    } catch (error) {
      setIsRegistering(false);
      throw error;
    }
  };

  const setUserProfile = async (
    username: string,
    ipfsCid: string,
    winsomeName: string
  ) => {
    if (!USER_PROFILE_CONTRACT_ADDRESS) {
      throw new Error("UserProfile contract address not configured");
    }

    setIsSettingProfile(true);
    try {
      await writeSetProfile({
        address: USER_PROFILE_CONTRACT_ADDRESS,
        abi: userProfileABI,
        functionName: "setProfile",
        args: [username, ipfsCid, winsomeName],
      });
    } catch (error) {
      setIsSettingProfile(false);
      throw error;
    }
  };

  const getProfileByAddress = async (address: `0x${string}`) => {
    if (!USER_PROFILE_CONTRACT_ADDRESS) {
      throw new Error("UserProfile contract address not configured");
    }

    try {
      const result = await refetchProfileByAddress();
      if (!result || !result.data) {
        // Return null if no profile data (user not registered)
        return null;
      }
      return result.data as ProfileData;
    } catch (error) {
      console.error("Error fetching profile by address:", error);
      // Return null on error to indicate user not registered
      return null;
    }
  };

  const getAllUsers = async () => {
    if (!USER_PROFILE_CONTRACT_ADDRESS) {
      throw new Error("UserProfile contract address not configured");
    }

    const result = await refetchAllUsers();
    return result.data as ProfileData[];
  };

  return {
    // Registration
    registerUser,
    isRegistering,
    isRegisterConfirming,
    isRegisterSuccess,

    // Profile setting
    setUserProfile,
    isSettingProfile,
    isSetProfileConfirming,
    isSetProfileSuccess,

    // Profile fetching
    getProfileByAddress,
    getAllUsers,
    profileByAddress: profileByAddress as ProfileData,
    allUsers: allUsers as ProfileData[],
  };
};
