import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useState, useCallback } from "react";
import chatABI from "../ABI/Chat_Abi.json";
import {
  getMessages,
  getGroupChats,
  getGroupChatUserCount,
  Message,
  GroupChatInfo,
} from "../lib/chatMessaging";

// Contract address - should be set via environment variable
const CHAT_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS as `0x${string}`;

export type { Message, GroupChatInfo };

export const useGroups = () => {
  const { address } = useAccount();
  const [chats, setChats] = useState<GroupChatInfo[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Write contract hooks
  const {
    writeContract: writeCreateGroup,
    data: createGroupHash,
    status: createGroupStatus,
    error: createGroupError,
  } = useWriteContract();
  const {
    writeContract: writeJoinGroup,
    data: joinGroupHash,
    status: joinGroupStatus,
    error: joinGroupError,
  } = useWriteContract();
  const {
    writeContract: writeSendMessage,
    data: sendMessageHash,
    status: sendMessageStatus,
    error: sendMessageError,
  } = useWriteContract();

  // Transaction receipt hooks
  const {
    isLoading: isCreateGroupConfirming,
    isSuccess: isCreateGroupSuccess,
  } = useWaitForTransactionReceipt({
    hash: createGroupHash,
  });

  const { isLoading: isJoinGroupConfirming, isSuccess: isJoinGroupSuccess } =
    useWaitForTransactionReceipt({
      hash: joinGroupHash,
    });

  const {
    isLoading: isSendMessageConfirming,
    isSuccess: isSendMessageSuccess,
  } = useWaitForTransactionReceipt({
    hash: sendMessageHash,
  });

  const createGroupChat = useCallback(
    (name: string) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        throw new Error("Chat contract address not configured");
      }
      writeCreateGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "createGroupChat",
        args: [name],
      });
    },
    [writeCreateGroup]
  );

  const joinGroupChat = useCallback(
    (groupChatId: bigint) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        throw new Error("Chat contract address not configured");
      }
      writeJoinGroup({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "joinGroupChat",
        args: [groupChatId],
      });
    },
    [writeJoinGroup]
  );

  const sendMessage = useCallback(
    (groupChatId: bigint, contentCid: string) => {
      if (!CHAT_CONTRACT_ADDRESS) {
        setError(new Error("Chat contract address not configured"));
        return;
      }
      writeSendMessage({
        address: CHAT_CONTRACT_ADDRESS,
        abi: chatABI,
        functionName: "sendMessage",
        args: [groupChatId, contentCid],
      });
    },
    [writeSendMessage]
  );

  const fetchMessages = useCallback(async (groupChatId: bigint) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages(groupChatId);
      setMessages(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroupChats = useCallback(async () => {
    if (!address) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const allChats = await getGroupChats(address);
      // Filter for group chats (userCount > 2)
      const groupChats: GroupChatInfo[] = [];
      for (const chat of allChats) {
        const count = await getGroupChatUserCount(chat.groupChatId);
        if (count > BigInt(2)) {
          groupChats.push(chat);
        }
      }
      setChats(groupChats);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  const getGroupChatUserCount = useCallback(async (groupChatId: bigint) => {
    return await getGroupChatUserCount(groupChatId);
  }, []);

  return {
    // Group creation
    createGroupChat,
    isCreatingGroup: createGroupStatus === "pending" || isCreateGroupConfirming,
    isCreateGroupSuccess,
    createGroupError,

    // Group joining
    joinGroupChat,
    isJoiningGroup: joinGroupStatus === "pending" || isJoinGroupConfirming,
    isJoinGroupSuccess,
    joinGroupError,

    // Messaging
    sendMessage,
    isSendingMessage:
      sendMessageStatus === "pending" || isSendMessageConfirming,
    isSendMessageSuccess,
    sendMessageError,

    // Read functions
    fetchMessages,
    fetchGroupChats,
    getGroupChatUserCount,

    // State
    chats,
    messages,
    loading,
    error,
  };
};
