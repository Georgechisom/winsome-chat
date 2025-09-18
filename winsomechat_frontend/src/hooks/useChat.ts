import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { useState, useCallback } from "react";
import chatABI from "../ABI/Chat_Abi.json";
import userABI from "../ABI/UserProfiles_Abi.json";
import { ProfileData } from "./useUserProfile";

// Contract addresses
const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;
const USER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_USER_PROFILE_CONTRACT_ADDRESS as `0x${string}`;

export type GroupChatInfo = {
  groupChatId: bigint;
  name: string;
};

export type Message = {
  sender: `0x${string}`;
  timestamp: bigint;
  contentCid: string;
};

export const useChat = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [chats, setChats] = useState<GroupChatInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Write contract hooks
  const {
    writeContract: writeSendPrivate,
    data: sendPrivateHash,
    status: sendPrivateStatus,
    error: sendPrivateError,
  } = useWriteContract();

  // Transaction receipt hooks
  const {
    isLoading: isSendPrivateConfirming,
    isSuccess: isSendPrivateSuccess,
  } = useWaitForTransactionReceipt({
    hash: sendPrivateHash,
  });

  const sendPrivateMessage = useCallback(
    (otherUser: `0x${string}`, messageContent: string) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      writeSendPrivate({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "sendPrivateMessage",
        args: [otherUser, messageContent],
      });
    },
    [writeSendPrivate]
  );

  const fetchMessages = useCallback(
    async (groupChatId: bigint) => {
      if (!publicClient || !CHAT_CONTRACT_ADDRESS) {
        console.log("message contract address", CHAT_CONTRACT_ADDRESS);
        console.log("message publicClient", publicClient);
        return [];
      }
      setLoading(true);
      setError(null);
      try {
        const data = await publicClient.readContract({
          address: CHAT_CONTRACT_ADDRESS,
          abi: chatABI,
          functionName: "getMessages",
          args: [groupChatId, 0, 1000], // start=0, count=1000
        });

        const fetchedMessages = data as Message[];
        console.log("Fetched messages:", fetchedMessages);
        setMessages(fetchedMessages);
        return fetchedMessages;
      } catch (e) {
        console.error("Error fetching messages:", e);
        setError(e as Error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [publicClient]
  );

  const fetchPrivateChats = useCallback(async () => {
    if (!address || !publicClient || !CHAT_CONTRACT_ADDRESS) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allChats = (await publicClient.readContract({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "getUserGroupChats",
        args: [address],
      })) as GroupChatInfo[];

      console.log("All user chats:", allChats);

      // Filter for private chats (userCount == 2) OR chats with messages but no explicit members
      const privateChats: GroupChatInfo[] = [];

      for (const chat of allChats) {
        try {
          // First check member count
          const count = (await publicClient.readContract({
            address: CHAT_CONTRACT_ADDRESS,
            abi: chatABI,
            functionName: "getGroupChatUserCount",
            args: [chat.groupChatId],
          })) as bigint;

          console.log(
            `Chat ${chat.groupChatId} has ${count.toString()} members`
          );

          if (count === BigInt(2)) {
            privateChats.push(chat);
          } else {
            // For private message chats, check if messages exist
            const messages = (await publicClient.readContract({
              address: CHAT_CONTRACT_ADDRESS,
              abi: chatABI,
              functionName: "getMessages",
              args: [chat.groupChatId, 0, 1], // Get first message to check if any exist
            })) as Message[];

            if (messages.length > 0) {
              console.log(
                `Chat ${chat.groupChatId} has messages, treating as private chat`
              );
              privateChats.push(chat);
            }
          }
        } catch (chatError) {
          console.error(`Error checking chat ${chat.groupChatId}:`, chatError);
        }
      }

      console.log("Private chats found:", privateChats);
      setChats(privateChats);
    } catch (e) {
      console.error("Error fetching private chats:", e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [address, publicClient]);

  // FIXED: Proper implementation of fetchChatMembers
  const fetchChatMembers = useCallback(
    async (groupChatId: bigint): Promise<`0x${string}`[]> => {
      if (!publicClient || !CHAT_CONTRACT_ADDRESS) return [];
      try {
        const data = await publicClient.readContract({
          address: CHAT_CONTRACT_ADDRESS,
          abi: chatABI,
          functionName: "getGroupChatMembers",
          args: [groupChatId],
        });
        const members = data as `0x${string}`[];
        console.log(`Members for chat ${groupChatId}:`, members);
        return members;
      } catch (e) {
        console.error("Error fetching chat members:", e);
        // Fallback: Try to get members from messages if direct member query fails
        try {
          const messages = (await publicClient.readContract({
            address: CHAT_CONTRACT_ADDRESS,
            abi: chatABI,
            functionName: "getMessages",
            args: [groupChatId, 0, 1000],
          })) as Message[];

          // Extract unique senders as members
          const uniqueSenders = [...new Set(messages.map((msg) => msg.sender))];
          console.log(
            `Fallback members from messages for chat ${groupChatId}:`,
            uniqueSenders
          );
          return uniqueSenders;
        } catch (fallbackError) {
          console.error("Fallback member fetch also failed:", fallbackError);
          return [];
        }
      }
    },
    [publicClient]
  );

  const searchUser = useCallback(
    async (userAddress: `0x${string}`): Promise<ProfileData | null> => {
      if (!publicClient || !USER_CONTRACT_ADDRESS) {
        console.log("contract address", USER_CONTRACT_ADDRESS);
        console.log("publicClient", publicClient);
        return null;
      }
      try {
        const data = (await publicClient.readContract({
          address: USER_CONTRACT_ADDRESS,
          abi: userABI,
          functionName: "getProfileByAddress",
          args: [userAddress],
        })) as ProfileData;

        if (!data.isRegistered) {
          console.log(`User ${userAddress} is not registered`);
          return null;
        }

        const profile: ProfileData = {
          username: data.username,
          ipfsCid: data.ipfsCid,
          isRegistered: data.isRegistered,
          address: userAddress,
        };
        return profile;
      } catch (e) {
        console.error(`Failed to search user ${userAddress}:`, e);
        return null;
      }
    },
    [publicClient]
  );

  return {
    // Private messaging
    sendPrivateMessage,
    isSendingPrivateMessage:
      sendPrivateStatus === "pending" || isSendPrivateConfirming,
    isSendPrivateSuccess,
    sendPrivateError,

    // Read functions
    fetchMessages,
    fetchPrivateChats,
    fetchChatMembers,
    searchUser,

    // State
    chats,
    messages,
    loading,
    error,
  };
};
