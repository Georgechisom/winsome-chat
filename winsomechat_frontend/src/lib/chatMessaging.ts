// Chat messaging utilities

import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import chatABI from "../ABI/Chat_Abi.json";
import userABI from "../ABI/UserProfiles_Abi.json";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
  ),
});

const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;
const USER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_USER_CONTRACT_ADDRESS as `0x${string}`;

export type Message = {
  sender: `0x${string}`;
  timestamp: bigint;
  content: string;
};

export type GroupChatInfo = {
  groupChatId: bigint;
  name: string;
};

export type ProfileData = {
  username: string;
  ipfsCid: string;
  isRegistered: boolean;
};

export const getMessages = async (groupChatId: bigint): Promise<Message[]> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return [];
  const data = (await publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatABI,
    functionName: "getMessages",
    args: [groupChatId, 0, 1000],
  })) as Array<{
    sender: `0x${string}`;
    timestamp: bigint;
    contentCid: string;
  }>;
  return data.map((msg: any) => ({
    sender: msg.sender,
    timestamp: msg.timestamp,
    content: msg.contentCid, // Map contentCid to content
  })) as Message[];
};

export const getGroupChats = async (
  user: `0x${string}`
): Promise<GroupChatInfo[]> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return [];
  const data = await publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatABI,
    functionName: "getUserGroupChats",
    args: [user],
  });
  return data as GroupChatInfo[];
};

export const getAllGroupChats = async (): Promise<GroupChatInfo[]> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return [];
  const data = await publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatABI,
    functionName: "getAllGroupChats",
    args: [],
  });
  return data as GroupChatInfo[];
};

export const leaveGroupChat = async (groupChatId: bigint): Promise<void> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return;
  const wallet = null; // This should be replaced with actual wallet signer if needed
  // Leaving group is a transaction, so it requires a signer and write contract call
  // This function is a placeholder; actual implementation depends on wallet integration
};

export const getGroupChatUserCount = async (
  groupChatId: bigint
): Promise<bigint> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return BigInt(0);
  const data = await publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatABI,
    functionName: "getGroupChatUserCount",
    args: [groupChatId],
  });
  return data as bigint;
};

export const getTotalGroupChatsPerUser = async (
  user: `0x${string}`
): Promise<bigint> => {
  if (!publicClient || !CHAT_CONTRACT_ADDRESS) return BigInt(0);
  const data = await publicClient.readContract({
    address: CHAT_CONTRACT_ADDRESS,
    abi: chatABI,
    functionName: "getTotalGroupChatsPerUser",
    args: [user],
  });
  return data as bigint;
};

export const getProfileByAddress = async (
  userAddress: `0x${string}`
): Promise<ProfileData | null> => {
  if (!publicClient || !USER_CONTRACT_ADDRESS) return null;
  try {
    const data = await publicClient.readContract({
      address: USER_CONTRACT_ADDRESS,
      abi: userABI,
      functionName: "getProfileByAddress",
      args: [userAddress],
    });
    return data as ProfileData;
  } catch (e) {
    return null;
  }
};
